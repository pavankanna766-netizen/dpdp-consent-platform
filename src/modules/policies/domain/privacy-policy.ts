import type {
  PolicySection,
} from "./policy-section";

export interface PrivacyPolicy {
  title: string;

  version: string;

  jurisdiction: string;

  sections: PolicySection[];
}