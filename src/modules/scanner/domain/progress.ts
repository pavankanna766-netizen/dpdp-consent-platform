export type ScanStage =
  | "launching-browser"
  | "collecting-cookies"
  | "detecting-trackers"
  | "analysing"
  | "completed";

export interface ScanProgress {
  stage: ScanStage;

  progress: number;

  status:
    | "pending"
    | "running"
    | "completed"
    | "failed";

  estimatedSeconds?: number;
}