import type {
  PolicySection,
} from "./policy-section";

export interface PolicyTemplate {
  id: string;

  name: string;

  sections: PolicySection[];
}