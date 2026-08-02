import { supabaseAdmin } from "@/lib/supabase/admin";
import { cache } from "react";

export type JobType =
  | "SCANNER_CRAWL"
  | "POLICY_GENERATION"
  | "COOKIE_POLICY_GENERATION"
  | "PDF_EXPORT"
  | "TRUST_CENTER_PUBLISH"
  | "SCHEDULED_CLEANUP"
  | "NOTIFICATION_EMAIL";

export type JobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "dlq"
  | "cancelled"
  | "paused";

export interface JobQueueRecord {
  id: string;
  company_id: string;
  job_type: JobType;
  payload: Record<string, unknown>;
  status: JobStatus;
  progress: number;
  attempts: number;
  max_attempts: number;
  last_error: string | null;
  correlation_id: string | null;
  concurrency_key: string | null;
  idempotency_key: string | null;
  cancelled_at: string | null;
  run_at: string;
  created_at: string;
  updated_at: string;
}

export async function enqueueJob(values: {
  company_id: string;
  job_type: JobType;
  payload: Record<string, unknown>;
  max_attempts?: number;
  delaySeconds?: number;
  idempotencyKey?: string;
  correlationId?: string;
  concurrencyKey?: string;
}) {
  // 1. Idempotency Check
  if (values.idempotencyKey) {
    const { data: existing } = await supabaseAdmin
      .from("job_queue")
      .select("*")
      .eq("company_id", values.company_id)
      .eq("idempotency_key", values.idempotencyKey)
      .maybeSingle();

    if (existing) {
      return { data: existing, error: null };
    }
  }

  const runAt = new Date(Date.now() + (values.delaySeconds || 0) * 1000).toISOString();

  return supabaseAdmin
    .from("job_queue")
    .insert({
      company_id: values.company_id,
      job_type: values.job_type,
      payload: values.payload,
      max_attempts: values.max_attempts ?? 3,
      status: "pending",
      progress: 0,
      idempotency_key: values.idempotencyKey || null,
      correlation_id: values.correlationId || `corr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      concurrency_key: values.concurrencyKey || null,
      run_at: runAt,
    })
    .select()
    .single();
}

export async function fetchNextPendingJob() {
  const now = new Date().toISOString();
  return supabaseAdmin
    .from("job_queue")
    .select("*")
    .eq("status", "pending")
    .lte("run_at", now)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
}

export async function updateJobProgress(jobId: string, progress: number) {
  return supabaseAdmin
    .from("job_queue")
    .update({
      progress: Math.min(100, Math.max(0, progress)),
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId)
    .select()
    .single();
}

export async function markJobStatus(
  jobId: string,
  status: JobStatus,
  errorMsg?: string
) {
  return supabaseAdmin
    .from("job_queue")
    .update({
      status,
      last_error: errorMsg || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId)
    .select()
    .single();
}

export async function cancelJob(companyId: string, jobId: string) {
  return supabaseAdmin
    .from("job_queue")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("company_id", companyId)
    .eq("id", jobId)
    .select()
    .single();
}

export async function moveToDLQ(
  job: JobQueueRecord,
  failureReason: string
) {
  await markJobStatus(job.id, "dlq", failureReason);

  return supabaseAdmin.from("job_dead_letter_queue").insert({
    company_id: job.company_id,
    job_id: job.id,
    job_type: job.job_type,
    payload: job.payload,
    failure_reason: failureReason,
    attempts: job.attempts,
  });
}

export const getJobQueueStats = cache(async function (companyId: string) {
  const { data: queue } = await supabaseAdmin
    .from("job_queue")
    .select("status")
    .eq("company_id", companyId);

  const stats = {
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    dlq: 0,
    cancelled: 0,
  };

  (queue || []).forEach((j) => {
    if (j.status in stats) {
      stats[j.status as keyof typeof stats]++;
    }
  });

  return stats;
});
