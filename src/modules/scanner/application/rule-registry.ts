import type {
  ComplianceRule,
} from "../domain/compliance-rule";

export class RuleRegistry {
  constructor(
    private readonly rules: ComplianceRule[]
  ) {}

  all() {
    return this.rules;
  }

  count() {
    return this.rules.length;
  }

  find(
    id: string
  ) {
    return this.rules.find(
      (rule) => rule.id === id
    );
  }
}