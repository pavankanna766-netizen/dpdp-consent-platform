import type {
  ComplianceBlueprint,
} from "../domain/compliance-blueprint";

export class BlueprintService {
  generate(input: {
  industry: string;

  country: string;

  website: boolean;
}): ComplianceBlueprint {
  const modules: ComplianceBlueprint["modules"] = [
    "privacy-policy",
    "terms",
    "vendor-register",
    "data-inventory",
    "retention",
    "dsar",
  ];

  if (input.website) {
    modules.push(
      "scanner",
      "cookie-policy",
      "cookie-banner",
      "trust-center"
    );
  }

  if (
    input.industry ===
    "ecommerce"
  ) {
    modules.push(
      "refund-policy",
      "shipping-policy"
    );
  }

  return {
    industry: input.industry,

    country: input.country,

    website: input.website,

    modules: [...new Set(modules)],
  };
}
}

export const blueprintService =
  new BlueprintService();