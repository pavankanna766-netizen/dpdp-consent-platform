import {
  createFindings,
} from "@/repositories/finding.repository";

import {
  ComplianceEngine,
} from "./compliance-engine";

import {
  mapFindings,
} from "./finding.mapper";

import {
  complianceRules,
} from "./rules";

import type {
  DetectionResult,
} from "../domain/detection";

import type {
  PageSignals,
} from "../domain/compliance-rule";

import type {
  CookieInfo,
} from "../domain/types";

export class ComplianceService {
  private readonly engine =
    new ComplianceEngine(
      complianceRules
    );

  evaluate(
    detections: DetectionResult[],
    cookies: CookieInfo[],
    pageSignals: PageSignals
  ) {
    return this.engine.evaluate({
      detections,
      cookies,
      pageSignals,
    });
  }

  async persist(
    scanId: string,
    detections: DetectionResult[],
    cookies: CookieInfo[],
    pageSignals: PageSignals
  ) {
    const findings =
      this.evaluate(
        detections,
        cookies,
        pageSignals
      );

    await createFindings(
      mapFindings(
        scanId,
        findings
      )
    );

    return findings;
  }
}

export const complianceService =
  new ComplianceService();