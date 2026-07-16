import type {
  ComplianceFinding,
} from "../domain/compliance-rule";

import type {
  DetectionResult,
} from "../domain/detection";

import type {
  CrawlResult,
} from "../infrastructure/playwright/crawler";

export interface ExecutiveSummary {
  title: string;

  summary: string;

  risk:
    | "Low"
    | "Moderate"
    | "High"
    | "Critical";
}

export class ExecutiveSummaryService {
  generate(
    score: number,
    crawl: CrawlResult,
    detections: DetectionResult[],
    findings: ComplianceFinding[]
  ): ExecutiveSummary {
    let risk:
      | "Low"
      | "Moderate"
      | "High"
      | "Critical";

    if (score >= 90) {
      risk = "Low";
    } else if (score >= 70) {
      risk = "Moderate";
    } else if (score >= 40) {
      risk = "High";
    } else {
      risk = "Critical";
    }

    const providers =
      detections
        .map(
          (d) =>
            d.tracker.provider
        )
        .join(", ");

    const summary =
      `PrivyStack scanned the website and found ${crawl.cookies.length} cookies, ${detections.length} trackers and ${findings.length} compliance findings. ` +
      `${crawl.hasConsentBanner ? "A consent banner was detected." : "No consent banner was detected."} ` +
      `${crawl.hasPrivacyPolicy ? "A Privacy Policy was detected." : "No Privacy Policy was detected."} ` +
      `${crawl.hasCookiePolicy ? "A Cookie Policy was detected." : "No Cookie Policy was detected."} ` +
      `${providers ? `Detected trackers include ${providers}. ` : ""}` +
      `Overall privacy risk is ${risk}.`;

    return {
      title:
        "Executive Summary",

      summary,

      risk,
    };
  }
}

export const executiveSummaryService =
  new ExecutiveSummaryService();