export type ScanJobStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed";

export type ScanStage =
  | "queued"
  | "launching-browser"
  | "collecting-cookies"
  | "detecting-trackers"
  | "analysing"
  | "generating-report"
  | "completed";

export interface ScanJob {
  id: string;

  status: ScanJobStatus;

  stage: ScanStage;

  progress: number;

  cookiesFound: number;

  trackersFound: number;

  startedAt?: string;

  completedAt?: string;
}