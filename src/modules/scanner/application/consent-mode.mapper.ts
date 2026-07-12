import type {
  ConsentModeResult,
} from "../domain/consent-mode";

export interface ConsentModeSummary {
  status: string;

  implementation: string;

  score: number;

  checks: {
    name: string;

    passed: boolean;
  }[];
}

export function mapConsentMode(
  result: ConsentModeResult
): ConsentModeSummary {
  return {
    status:
      result.detected
        ? "Detected"
        : "Not Detected",

    implementation:
      result.implementation,

    score:
      result.score,

    checks: [
      {
        name:
          "Default Consent",

        passed:
          result.detected,
      },

      {
        name:
          "ad_storage",

        passed:
          result.adStorage,
      },

      {
        name:
          "analytics_storage",

        passed:
          result.analyticsStorage,
      },

      {
        name:
          "ad_user_data",

        passed:
          result.adUserData,
      },

      {
        name:
          "ad_personalization",

        passed:
          result.adPersonalization,
      },

      {
        name:
          "wait_for_update",

        passed:
          result.waitForUpdate,
      },
    ],
  };
}