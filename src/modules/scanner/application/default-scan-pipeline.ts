import {
  createScan,
  completeScan,
  updateScanProgress,
} from "@/repositories/scanner.repository";

import { crawlerService } from "./crawler.service";
import { detectionService } from "./detection.service";
import { complianceService } from "./compliance.service";
import { scoreEngine } from "./score-engine";

import type {
  ScanContext,
  ScanPipeline,
} from "./scan-orchestrator";

export class DefaultScanPipeline
  implements ScanPipeline
{
  async execute(
    context: ScanContext
  ): Promise<string> {
    const startedAt =
      new Date();

    const { data: scan } =
      await createScan({
        company_id:
          context.companyId,

        url: context.url,

        status: "running",

        stage:
          "launching-browser",

        progress: 5,

        started_at:
          startedAt.toISOString(),
      });

    if (!scan) {
      throw new Error(
        "Failed to create scan."
      );
    }

    try {
      await updateScanProgress(
        scan.id,
        {
          stage:
            "launching-browser",
          progress: 10,
        }
      );

      const crawlResult =
        await crawlerService.crawl(
          context.url
        );

      await updateScanProgress(
        scan.id,
        {
          stage:
            "collecting-cookies",
          progress: 40,
          cookies_found:
            crawlResult.cookies.length,
        }
      );

      const detections =
        detectionService.detect(
          crawlResult
        );

      await detectionService.persist(
        scan.id,
        detections
      );

      await updateScanProgress(
        scan.id,
        {
          stage:
            "detecting-trackers",
          progress: 65,
          trackers_found:
            detections.length,
        }
      );

      const pageSignals = {
  hasConsentBanner:
    crawlResult.hasConsentBanner,

  hasRejectButton:
    crawlResult.hasRejectButton,

  hasManagePreferences:
    crawlResult.hasManagePreferences,

  hasPrivacyPolicy:
    crawlResult.hasPrivacyPolicy,
};

const findings =
  await complianceService.persist(
    scan.id,
    detections,
    crawlResult.cookies,
    pageSignals
  );

      await updateScanProgress(
        scan.id,
        {
          stage:
            "analysing",
          progress: 90,
        }
      );

      const score =
        scoreEngine.calculate(
          findings
        );

      await completeScan(
        scan.id,
        {
          status:
            "completed",

          stage:
            "completed",

          progress: 100,

          completed_at:
            new Date().toISOString(),

          duration_ms:
            Date.now() -
            startedAt.getTime(),

          overall_score:
            score,

          cookies_found:
            crawlResult.cookies.length,

          trackers_found:
            detections.length,

          findings_count:
            findings.length,
        }
      );

      return scan.id;
    } catch (error) {
      await updateScanProgress(
        scan.id,
        {
          status:
            "failed",

          stage:
            "completed",

          progress: 100,
        }
      );

      throw error;
    }
  }
}

export const defaultScanPipeline =
  new DefaultScanPipeline();