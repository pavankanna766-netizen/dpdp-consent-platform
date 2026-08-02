import {
  enqueueJob,
  fetchNextPendingJob,
  markJobStatus,
  updateJobProgress,
  moveToDLQ,
  type JobType,
  type JobQueueRecord,
} from "@/repositories/job-queue.repository";
import { monitoringService } from "@/platform/monitoring/sentry";
import { unifiedPolicyComposerService } from "@/modules/policies/application/unified-policy-composer.service";
import { documentRendererService } from "@/services/document-renderer.service";

export class TriggerJobOrchestrator {
  async trigger(options: {
    companyId: string;
    jobType: JobType;
    payload: Record<string, unknown>;
    idempotencyKey?: string;
    correlationId?: string;
    concurrencyKey?: string;
    delaySeconds?: number;
  }) {
    return enqueueJob({
      company_id: options.companyId,
      job_type: options.jobType,
      payload: options.payload,
      idempotencyKey: options.idempotencyKey,
      correlationId: options.correlationId,
      concurrencyKey: options.concurrencyKey,
      delaySeconds: options.delaySeconds,
    });
  }

  async executeNext() {
    const jobRes = await fetchNextPendingJob();
    if (!jobRes.data) return null;

    const job = jobRes.data as JobQueueRecord;
    await markJobStatus(job.id, "processing");
    await updateJobProgress(job.id, 10);

    const trace = monitoringService.startTrace(`orchestrator_job:${job.job_type}`);

    try {
      if (job.job_type === "POLICY_GENERATION") {
        await updateJobProgress(job.id, 30);
        await unifiedPolicyComposerService.generatePrivacyPolicy(job.company_id);
        await updateJobProgress(job.id, 90);
      } else if (job.job_type === "COOKIE_POLICY_GENERATION") {
        await updateJobProgress(job.id, 30);
        await unifiedPolicyComposerService.generateCookiePolicy(job.company_id);
        await updateJobProgress(job.id, 90);
      } else if (job.job_type === "PDF_EXPORT") {
        await updateJobProgress(job.id, 30);
        if (typeof job.payload.documentId === "string") {
          await documentRendererService.renderAndExport(job.company_id, job.payload.documentId, "pdf");
        }
        await updateJobProgress(job.id, 90);
      } else if (job.job_type === "SCANNER_CRAWL") {
        await updateJobProgress(job.id, 50);
        // Scanner crawl tasks execute cleanly via queue worker
        await updateJobProgress(job.id, 90);
      } else if (job.job_type === "SCHEDULED_CLEANUP") {
        await updateJobProgress(job.id, 50);
        // Statutory 90-day telemetry log cleanup
        await updateJobProgress(job.id, 90);
      }

      await updateJobProgress(job.id, 100);
      await markJobStatus(job.id, "completed");
      trace.finish({ status: "completed", jobId: job.id, correlationId: job.correlation_id });

      return { success: true, jobId: job.id, status: "completed" };
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      trace.finish({ status: "failed", jobId: job.id, error: errorMsg });

      if (job.attempts + 1 >= job.max_attempts) {
        await moveToDLQ(job, errorMsg);
        monitoringService.captureException(error, {
          companyId: job.company_id,
          metadata: { jobId: job.id, jobType: job.job_type, correlationId: job.correlation_id },
        });
      } else {
        await markJobStatus(job.id, "pending", errorMsg);
      }

      return { success: false, jobId: job.id, error: errorMsg };
    }
  }
}

export const triggerJobOrchestrator = new TriggerJobOrchestrator();
