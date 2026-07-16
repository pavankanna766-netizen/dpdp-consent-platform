import type {
  ComplianceModule,
} from "./compliance-module";

export interface ComplianceStatus {
  module: ComplianceModule;

  completed: boolean;

  progress: number;
}