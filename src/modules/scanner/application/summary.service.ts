import {
  getLatestScan,
  getScanSummary,
  listRecentScans,
} from "@/repositories/scanner.repository";

import {
  executiveSummaryService,
} from "./executive-summary.service";

import {
  mapTechnologyStack,
} from "./technology.mapper";

import {
  getTrendHistory,
} from "@/repositories/scanner.repository";

import {
  getScanJob,
} from "@/repositories/scanner.repository";

import {
  progressService,
} from "./progress.service";

import {
  mapDashboardSummary,
} from "./dashboard.mapper";

import {
  trendService,
} from "./trend.service";

import {
  consentModeService,
} from "./consent-mode.service";

import {
  mapConsentMode,
} from "./consent-mode.mapper";

import {
  changeDetector,
} from "./change-detector";

import {
  changeComparator,
} from "./change-comparator";

export class SummaryService {
  async get(
    scanId: string
  ) {
    const summary =
      await getScanSummary(
        scanId
      );

    const dashboard =
      mapDashboardSummary(
        summary
      );

    const executiveSummary =
      executiveSummaryService.generate(
        dashboard.score,
        {
          cookies:
            summary.scan?.cookies_found
              ? new Array(
                  summary.scan.cookies_found
                ).fill({})
              : [],

          scripts: [],

          inlineScripts: [],

          requests: [],

          hasConsentBanner:
            summary.findings.every(
              (f) =>
                f.title !==
                "Consent banner not detected"
            ),

          hasRejectButton:
            summary.findings.every(
              (f) =>
                f.title !==
                "Reject option not detected"
            ),

          hasManagePreferences:
            summary.findings.every(
              (f) =>
                f.title !==
                "Manage Preferences option not detected"
            ),

          hasPrivacyPolicy:
            summary.findings.every(
              (f) =>
                f.title !==
                "Privacy Policy not detected"
            ),
        },
        summary.detections.map(
          (d) => ({
            tracker: {
              id:
                d.provider,
              provider:
                d.provider,
              category:
                d.category,
              requiresConsent:
                true,
              cookies: [],
              scripts: [],
              domains: [],
              description: "",
            },
            confidence: 100,
            matchedBy: [],
            evidence: [],
          })
        ),
        summary.findings.map(
          (f) => ({
            id: f.id,
            severity:
              f.severity,
            title: f.title,
            recommendation:
              f.recommendation,
          })
        )
      );

      const scoreBreakdown = {
  score:
    dashboard.score,

  items:
    summary.findings.map(
      (finding) => ({
        id: finding.id,

        title:
          finding.title,

        impact:
          finding.severity ===
          "critical"
            ? 30
            : finding.severity ===
              "high"
            ? 20
            : finding.severity ===
              "medium"
            ? 10
            : 5,

        type:
          "penalty",
      })
    ),
};

const technologyStack =
  mapTechnologyStack(
    summary.detections.map(
      (d) => ({
        provider:
          d.provider,

        category:
          d.category,
      })
    )
  );

const trendHistory =
  await getTrendHistory(
    summary.scan.company_id
  );

const trend =
  trendService.calculate(
    trendHistory.data ?? []
  );

  const changes =
  changeDetector.compare(
    dashboard.score,
    trend.previous
  );

  changes.push(
  ...changeComparator.compare(
    {
      detections: [],

      findings: [],
    },
    {
      detections:
        summary.detections.map(
          (d) => ({
            tracker: {
              provider:
                d.provider,

              category:
                d.category,

              id:
                d.provider,

              requiresConsent:
                true,

              cookies: [],

              scripts: [],

              domains: [],

              description:
                "",
            },

            confidence:
              100,

            matchedBy: [],

            evidence: [],
          })
        ),

      findings:
        summary.findings.map(
          (f) => ({
            id: f.id,

            severity:
              f.severity,

            title:
              f.title,

            recommendation:
              f.recommendation,
          })
        ),
    }
  )
);

  const consentMode =
  mapConsentMode(
    consentModeService.detect(
      []
    )
  );

   return {
  ...summary,

  dashboard,

  executiveSummary,

  scoreBreakdown,

  trend,

  technologyStack,

  consentMode,

  changes,
};
  }

  async latest(
    companyId: string
  ) {
    return getLatestScan(
      companyId
    );
  }

  async history(
    companyId: string
  ) {
    return listRecentScans(
      companyId
    );
  }

  async progress(
  scanId: string
) {
  const scan =
    await getScanJob(
      scanId
    );

  if (!scan.data) {
    throw new Error(
      "Scan not found."
    );
  }

  return progressService.fromScan(
    scan.data
  );
}
}



export const summaryService =
  new SummaryService();