import type {
  ComplianceRule,
} from "../../domain/compliance-rule";

export const excessiveMarketingRule: ComplianceRule = {
  id: "excessive-marketing-trackers",

  name:
    "Marketing Trackers",

  description:
    "Large numbers of marketing trackers increase privacy risk.",

  evaluate(input) {
    const count =
      input.detections.filter(
        (d) =>
          d.tracker.category ===
          "marketing"
      ).length;

    if (count <= 5) {
      return null;
    }

    return {
      id: "excessive-marketing-trackers",

      severity: "medium",

      title:
        "Large number of marketing trackers detected",

      recommendation:
        "Review whether all marketing technologies are necessary and obtain valid consent before activation.",
    };
  },
};