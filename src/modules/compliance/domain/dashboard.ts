import type {
  ComplianceStatus,
} from "./compliance-status";

import type {
  ComplianceRecommendation,
} from "./recommendation";

export interface ComplianceDashboard {
  progress: number;

  items: ComplianceStatus[];

  recommendation:
    | ComplianceRecommendation
    | null;
}