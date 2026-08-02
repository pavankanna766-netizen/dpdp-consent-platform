import {
  enqueueJob,
  fetchNextPendingJob,
  markJobStatus,
  moveToDLQ,
  type JobType,
} from "@/repositories/job-queue.repository";
import { monitoringService } from "@/platform/monitoring/sentry";

export class JobQueueManager {
  async dispatch(companyId: string, jobType: JobType, payload: Record<string, unknown>, delaySeconds: number = 0) {
    return enqueueJob({
      company_id: companyId,
      job_type: jobType,
      payload,
      max_attempts: 3,
      delaySeconds,
    });
  }

  async processNextJob() {
    const jobRes = await fetchNextPendingJob();
    if (!jobRes.data) return null;

    const job = jobRes.data;
    await markJobStatus(job.id, "processing");

    const trace = monitoringService.startTrace(`job_execution:${job.job_type}`);

    try {
      if (job.job_type === "SCANNER_CRAWL") {
        console.log(`Processing Scanner Job ${job.id} for company ${job.company_id}`);
      } else if (job.job_type === "POLICY_GENERATION") {
        console.log(`Processing Policy Generation Job ${job.id}`);
      } else if (job.job_type === "PDF_EXPORT") {
        console.log(`Processing PDF Export Job ${job.id}`);
      } else {
        console.log(`Processing Job ${job.job_type} (${job.id})`);
      }

      await markJobStatus(job.id, "completed");
      trace.finish({ status: "completed", jobId: job.id });
      return { success: true, jobId: job.id };
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      trace.finish({ status: "failed", jobId: job.id, error: errorMsg });

      if (job.attempts + 1 >= job.max_attempts) {
        await moveToDLQ(job, errorMsg);
        monitoringService.captureException(error, { companyId: job.company_id, metadata: { jobId: job.id, jobType: job.job_type } });
      } else {
        await markJobStatus(job.id, "pending", errorMsg);
      }

      return { success: false, jobId: job.id, error: errorMsg };
    }
  }
}

export const jobQueueManager = new JobQueueManager();
