import type {
  ComplianceStatus,
} from "../domain/compliance-status";

import type {
  ComplianceRecommendation,
} from "../domain/recommendation";

const dpdpModuleMappings: Record<string, { dpdpReference: string; description: string; impact: "low" | "medium" | "high"; estimatedMinutes: number }> = {
  "privacy-policy": {
    dpdpReference: "Section 5 & Section 6",
    description: "Publish a clear and comprehensive privacy notice specifying what personal data is processed, the purposes of processing, and how data principals can exercise their rights under DPDP Act Section 5.",
    impact: "high",
    estimatedMinutes: 15
  },
  "consent-banner": {
    dpdpReference: "Section 6",
    description: "Deploy an unconditional, unambiguous, and specific consent banner in clear plain language, enabling users to accept or withdraw consent per Section 6.",
    impact: "high",
    estimatedMinutes: 10
  },
  "cookie-banner": {
    dpdpReference: "Section 6",
    description: "Provide users with granular toggle controls to give separate, informed consent for distinct categories of cookies (e.g., analytics, marketing) under Section 6.",
    impact: "high",
    estimatedMinutes: 10
  },
  "cookie-policy": {
    dpdpReference: "Section 5",
    description: "Maintain an itemized list of all cookies and trackers, their purposes, and lifespans as part of the Section 5 notice requirements.",
    impact: "high",
    estimatedMinutes: 10
  },
  "dsar": {
    dpdpReference: "Section 11 & Section 12",
    description: "Set up a structured workflow to handle Data Subject Access Requests (DSAR), allowing users to request access, correction, or erasure of their data under Sections 11 & 12.",
    impact: "high",
    estimatedMinutes: 20
  },
  "retention": {
    dpdpReference: "Section 8(7)",
    description: "Establish automated data deletion policies to erase personal data as soon as its purpose has been served or consent is withdrawn under Section 8(7).",
    impact: "high",
    estimatedMinutes: 15
  },
  "vendor-register": {
    dpdpReference: "Section 8(1) & Section 8(2)",
    description: "Log and maintain contracts with third-party Data Processors to ensure compliance with the fiduciary obligations under Section 8.",
    impact: "medium",
    estimatedMinutes: 25
  },
  "data-inventory": {
    dpdpReference: "Section 8",
    description: "Map and document all personal data flows, storage locations, and access controls to build an audit-ready inventory required by Section 8.",
    impact: "high",
    estimatedMinutes: 30
  },
  "trust-center": {
    dpdpReference: "Section 8 & Section 11",
    description: "Provide a public transparency portal containing your DPO contact details, DPDP audit compliance certificates, and simplified privacy dashboards.",
    impact: "medium",
    estimatedMinutes: 10
  },
  "terms": {
    dpdpReference: "Section 6",
    description: "Ensure terms of service do not make consent a prerequisite for unrelated services, maintaining Section 6's unconditional consent rule.",
    impact: "medium",
    estimatedMinutes: 20
  }
};

export class RecommendationService {
  getNext(
    items: ComplianceStatus[]
  ): ComplianceRecommendation | null {
    const next =
      items.find(
        (item) =>
          !item.completed
      );

    if (!next) {
      return null;
    }

    const mapping = dpdpModuleMappings[next.module] || {
      dpdpReference: "General obligations",
      description: "Complete this module to improve your DPDP compliance.",
      impact: "high" as const,
      estimatedMinutes: 5
    };

    return {
      module: next.module,

      title: this.label(
        next.module
      ),

      description: mapping.description,

      estimatedMinutes: mapping.estimatedMinutes,

      impact: mapping.impact,

      dpdpReference: mapping.dpdpReference,
    };
  }

  private label(
    module: string
  ) {
    return module
      .split("-")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  }
}

export const recommendationService =
  new RecommendationService();