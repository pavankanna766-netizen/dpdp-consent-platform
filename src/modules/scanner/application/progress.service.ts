import type {
  ScanProgress,
} from "../domain/progress";

export class ProgressService {
  fromScan(
    scan: {
      stage: string;

      progress: number;

      status: string;
    }
  ): ScanProgress {
    return {
      stage:
        scan.stage as ScanProgress["stage"],

      progress:
        scan.progress,

      status:
        scan.status as ScanProgress["status"],

      estimatedSeconds:
        Math.max(
          0,
          Math.round(
            (100 -
              scan.progress) /
              5
          )
        ),
    };
  }
}

export const progressService =
  new ProgressService();