import type {
  PolicySection,
} from "../domain/policy-section";

export class PolicyComposerService {
  compose(
    required: PolicySection[],
    optional: PolicySection[] = []
  ): PolicySection[] {
    const map =
      new Map<
        string,
        PolicySection
      >();

    required.forEach(
      (section) =>
        map.set(
          section.id,
          section
        )
    );

    optional.forEach(
      (section) =>
        map.set(
          section.id,
          section
        )
    );

    return [
      ...map.values(),
    ];
  }
}

export const policyComposerService =
  new PolicyComposerService();