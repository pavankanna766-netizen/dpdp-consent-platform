import { createDetections } from "@/repositories/detection.repository";

import { detectTrackers } from "../infrastructure/tracker-library/detector";
import { mapDetections } from "./detection.mapper";

import type { DetectionResult } from "../domain/detection";
import type { CrawlResult } from "../infrastructure/playwright/crawler";

export class DetectionService {
  detect(
    scan: CrawlResult
  ): DetectionResult[] {
    return detectTrackers({
      cookies: scan.cookies.map(
        (cookie) => cookie.name
      ),

      scripts: scan.scripts,

      requests: scan.requests,
    });
  }

  async persist(
    scanId: string,
    detections: DetectionResult[]
  ) {
    const rows =
      mapDetections(
        scanId,
        detections
      );

    return createDetections(rows);
  }
}

export const detectionService =
  new DetectionService();