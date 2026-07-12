import type {
  ScanReport,
  DetectionReport,
  ComplianceReport,
} from "../domain/report";

interface ReportSummary {
  scan: {
    id: string;
    url: string;
    created_at: string;
  };

  dashboard: {
    score: number;
    risk: string;
    cookies: number;
    trackers: number;
    findings: number;
  };

  detections: DetectionReport[];

  findings: ComplianceReport[];
}

export function mapScanReport(
  summary: ReportSummary
): ScanReport {
  return {
    id:
      summary.scan.id,

    url:
      summary.scan.url,

    generatedAt:
      summary.scan.created_at,

    score:
      summary.dashboard.score,

    risk:
      summary.dashboard.risk,

    cookies:
      summary.dashboard.cookies,

    trackers:
      summary.dashboard.trackers,

    findings:
      summary.dashboard.findings,

    detections:
      summary.detections,

    compliance:
      summary.findings,
  };
}