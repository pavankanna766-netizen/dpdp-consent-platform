import type {
  PrivacyPdf,
} from "../domain/pdf";

import type {
  ScanReport,
} from "@/modules/scanner/domain/report";

export function mapPdf(
  report: ScanReport
): PrivacyPdf {
  return {
    title:
      "PrivyStack Privacy Report",

    generatedAt:
      report.generatedAt,

    sections: [
      {
        title:
          "Executive Summary",

        content: [
          `Privacy Score: ${report.score}`,
          `Risk: ${report.risk}`,
          `Cookies: ${report.cookies}`,
          `Trackers: ${report.trackers}`,
          `Findings: ${report.findings}`,
        ],
      },
    ],
  };
}