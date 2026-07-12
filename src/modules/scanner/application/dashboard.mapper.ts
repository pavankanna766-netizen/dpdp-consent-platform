import type {
  DashboardSummary,
} from "../domain/dashboard";

interface ScanSummary {
  overall_score?: number;
  cookies_found?: number;
}

interface DetectionSummary {
  id: string;
}

interface FindingSummary {
  id: string;
}

export function mapDashboardSummary(
  summary: {
    scan: ScanSummary | null;
    detections: DetectionSummary[];
    findings: FindingSummary[];
  }
): DashboardSummary {
  const scan = summary.scan;

  const score =
    scan?.overall_score ?? 0;

  const cookies =
    scan?.cookies_found ?? 0;

  return {
    score,

    cookies,

    trackers:
      summary.detections.length,

    findings:
      summary.findings.length,

    risk:
      score >= 85
        ? "low"
        : score >= 60
        ? "medium"
        : "high",
  };
}