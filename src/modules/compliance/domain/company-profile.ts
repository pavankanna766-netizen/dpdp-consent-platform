import type {
  ComplianceBlueprint,
} from "./compliance-blueprint";

import type {
  ComplianceStatus,
} from "./compliance-status";

export interface CompanyComplianceProfile {
  companyId: string;

  blueprint: ComplianceBlueprint;

  items: ComplianceStatus[];

  progress: number;

  lastScanScore: number | null;
}