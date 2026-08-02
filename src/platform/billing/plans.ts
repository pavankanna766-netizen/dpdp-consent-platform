export type PlanTier = "starter" | "professional" | "business" | "enterprise";

export interface PlanConfig {
  id: PlanTier;
  name: string;
  priceMonthlyINR: number;
  priceYearlyINR: number;
  limits: {
    monthlyScans: number;
    monthlyApiRequests: number;
    monthlyPoliciesGenerated: number;
    maxTeamMembers: number;
    retentionDays: number;
  };
  features: {
    trustCenterCustomDomain: boolean;
    pdfBranding: boolean;
    customVariables: boolean;
    digitalSignatures: boolean;
    multiFormatExporters: boolean;
    dedicatedDpoSupport: boolean;
  };
}

export const PLAN_CONFIGS: Record<PlanTier, PlanConfig> = {
  starter: {
    id: "starter",
    name: "Starter",
    priceMonthlyINR: 3999,
    priceYearlyINR: 39990,
    limits: {
      monthlyScans: 5,
      monthlyApiRequests: 10000,
      monthlyPoliciesGenerated: 10,
      maxTeamMembers: 3,
      retentionDays: 90,
    },
    features: {
      trustCenterCustomDomain: false,
      pdfBranding: false,
      customVariables: true,
      digitalSignatures: false,
      multiFormatExporters: true,
      dedicatedDpoSupport: false,
    },
  },
  professional: {
    id: "professional",
    name: "Professional",
    priceMonthlyINR: 11999,
    priceYearlyINR: 119990,
    limits: {
      monthlyScans: 25,
      monthlyApiRequests: 100000,
      monthlyPoliciesGenerated: 50,
      maxTeamMembers: 10,
      retentionDays: 365,
    },
    features: {
      trustCenterCustomDomain: true,
      pdfBranding: true,
      customVariables: true,
      digitalSignatures: true,
      multiFormatExporters: true,
      dedicatedDpoSupport: false,
    },
  },
  business: {
    id: "business",
    name: "Business",
    priceMonthlyINR: 27999,
    priceYearlyINR: 279990,
    limits: {
      monthlyScans: 100,
      monthlyApiRequests: 1000000,
      monthlyPoliciesGenerated: 250,
      maxTeamMembers: 25,
      retentionDays: 1095,
    },
    features: {
      trustCenterCustomDomain: true,
      pdfBranding: true,
      customVariables: true,
      digitalSignatures: true,
      multiFormatExporters: true,
      dedicatedDpoSupport: true,
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    priceMonthlyINR: 79999,
    priceYearlyINR: 799990,
    limits: {
      monthlyScans: 999999,
      monthlyApiRequests: 10000000,
      monthlyPoliciesGenerated: 999999,
      maxTeamMembers: 9999,
      retentionDays: 3650,
    },
    features: {
      trustCenterCustomDomain: true,
      pdfBranding: true,
      customVariables: true,
      digitalSignatures: true,
      multiFormatExporters: true,
      dedicatedDpoSupport: true,
    },
  },
};
