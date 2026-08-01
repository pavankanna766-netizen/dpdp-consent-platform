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

import {
  FindingWeights,
} from "./finding-weight";

export class SummaryService {
  async get(
    companyId: string,
    scanId: string
  ) {
    const summary =
      await getScanSummary(
        companyId,
        scanId
      );

    const consentModeFinding = summary.findings.find(
      (f) => f.title === "google-consent-mode-data"
    );

    let parsedConsentMode;
    if (consentModeFinding) {
      try {
        parsedConsentMode = JSON.parse(consentModeFinding.recommendation);
      } catch {
        // Ignore
      }
    }

    summary.findings = summary.findings.filter(
      (f) => f.title !== "google-consent-mode-data"
    );

    const dashboard =
      mapDashboardSummary(
        summary
      );

    const executiveSummary =
      executiveSummaryService.generate(
        dashboard.score,
        {
          siteHost: undefined,

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

          hasCookiePolicy:
            summary.findings.every(
              (f) =>
                f.title !==
                "Cookie Policy not detected"
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
            kind:
              f.severity === "info"
                ? "observation"
                : "issue",
            severity:
              f.severity,
            title: f.title,
            recommendation:
              f.recommendation,
          })
        )
      );

    const scoreBreakdown = {
      score: dashboard.score,
      items: summary.findings.map((finding) => ({
        id: finding.id,
        title: finding.title,
        impact: FindingWeights[finding.severity as keyof typeof FindingWeights] ?? 0,
        type: finding.severity === "info" ? "reward" : "penalty",
      })),
    };

    const technologyStack = mapTechnologyStack(
      summary.detections.map((d) => ({
        provider: d.provider,
        category: d.category,
      }))
    );

    const trendHistory = await getTrendHistory(
      summary.scan!.company_id
    );

    const trend = trendService.calculate(
      trendHistory.data ?? []
    );

    const changes = changeDetector.compare(
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
          detections: summary.detections.map((d) => ({
            tracker: {
              provider: d.provider,
              category: d.category,
              id: d.provider,
              requiresConsent: true,
              cookies: [],
              scripts: [],
              domains: [],
              description: "",
            },
            confidence: 100,
            matchedBy: [],
            evidence: [],
          })),
          findings: summary.findings.map((f) => ({
            id: f.id,
            kind: f.severity === "info" ? "observation" : "issue",
            severity: f.severity,
            title: f.title,
            recommendation: f.recommendation,
          })),
        }
      )
    );

    const consentMode = mapConsentMode(
      parsedConsentMode ?? consentModeService.detect([])
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
    companyId: string,
    scanId: string
  ) {
    const scan =
      await getScanJob(
        companyId,
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
