import type {
  DetectionResult,
} from "./detection";

import type {
  CookieInfo,
} from "./types";

export type FindingSeverity =
  | "critical"
  | "high"
  | "medium"
  | "low";

export interface ComplianceEvidence {
  cookie?: string;

  tracker?: string;

  domain?: string;

  secure?: boolean;

  httpOnly?: boolean;

  sameSite?: string;

  rule?: string;
}

export interface ComplianceFinding {
  id: string;

  severity: FindingSeverity;

  title: string;

  recommendation: string;

  evidence?: ComplianceEvidence;
}

export interface PageSignals {
  hasConsentBanner: boolean;

  hasRejectButton: boolean;

  hasManagePreferences: boolean;

  hasPrivacyPolicy: boolean;
}

export interface ComplianceInput {
  detections: DetectionResult[];

  cookies: CookieInfo[];

  pageSignals: PageSignals;
}

export interface ComplianceRule {
  id: string;

  name: string;

  description: string;

  evaluate(
    input: ComplianceInput
  ): ComplianceFinding | null;
}