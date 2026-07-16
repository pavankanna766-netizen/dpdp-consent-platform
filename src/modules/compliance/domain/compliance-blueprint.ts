import type {
  ComplianceModule,
} from "./compliance-module";

export interface ComplianceBlueprint {
  industry: string;

  country: string;

  website: boolean;

  modules: ComplianceModule[];
}