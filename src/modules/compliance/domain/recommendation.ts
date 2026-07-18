import type {
  ComplianceModule,
} from "./compliance-module";

export interface ComplianceRecommendation {
  module: ComplianceModule;

  title: string;

  description: string;

  estimatedMinutes: number;

  impact:
    | "low"
    | "medium"
    | "high";

  dpdpReference?: string;
}