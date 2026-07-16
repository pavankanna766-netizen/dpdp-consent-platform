import type {
  ComplianceBlueprint,
} from "../domain/compliance-blueprint";

import type {
  ComplianceStatus,
} from "../domain/compliance-status";

export class ComplianceEngine {
  build(
    blueprint: ComplianceBlueprint
  ): ComplianceStatus[] {
    return blueprint.modules.map(
      (module) => ({
        module,

        completed: false,

        progress: 0,
      })
    );
  }
}

export const complianceEngine =
  new ComplianceEngine();