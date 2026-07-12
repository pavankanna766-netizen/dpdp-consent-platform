import type {
  ComplianceFinding,
  ComplianceInput,
  ComplianceRule,
} from "../domain/compliance-rule";

export class ComplianceEngine {
  constructor(
    private readonly rules: ComplianceRule[]
  ) {}

  evaluate(
    input: ComplianceInput
  ): ComplianceFinding[] {
    return this.rules
      .map((rule) =>
        rule.evaluate(input)
      )
      .filter(
        (
          finding
        ): finding is ComplianceFinding =>
          finding !== null
      );
  }
}