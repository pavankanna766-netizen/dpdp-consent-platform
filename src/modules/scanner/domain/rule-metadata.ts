export interface RuleMetadata {
  id: string;

  title: string;

  category:
    | "consent"
    | "cookies"
    | "privacy"
    | "trackers";

  severity:
    | "critical"
    | "high"
    | "medium"
    | "low";

  description: string;

  recommendation: string;

  dpdpReference?: string;
}