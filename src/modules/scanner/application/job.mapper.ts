import type {
  ScanJob,
} from "../domain/job";

export function mapScanJob(
  scan: {
    id: string;
    status: string;
    stage?: string;
    progress?: number;
    cookies_found?: number;
    trackers_found?: number;
    started_at?: string;
    completed_at?: string;
  }
): ScanJob {
  return {
    id: scan.id,

    status:
      scan.status as ScanJob["status"],

    stage:
      (scan.stage as ScanJob["stage"]) ??
      "queued",

    progress:
      scan.progress ?? 0,

    cookiesFound:
      scan.cookies_found ?? 0,

    trackersFound:
      scan.trackers_found ?? 0,

    startedAt:
      scan.started_at,

    completedAt:
      scan.completed_at,
  };
}