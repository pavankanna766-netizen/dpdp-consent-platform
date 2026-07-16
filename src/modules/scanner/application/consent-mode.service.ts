import type {
  ConsentModeResult,
} from "../domain/consent-mode";

export class ConsentModeService {
  detect(
    inlineScripts: string[],
    liveConsentMode?: ConsentModeResult
  ): ConsentModeResult {
    if (liveConsentMode && liveConsentMode.detected) {
      return liveConsentMode;
    }

    const source =
      inlineScripts.join("\n");

    const hasDefault =
      source.includes(
        "consent"
      ) &&
      source.includes(
        "default"
      );

    const hasUpdate =
      source.includes(
        "consent"
      ) &&
      source.includes(
        "update"
      );

    const adStorage =
      source.includes(
        "ad_storage"
      );

    const analyticsStorage =
      source.includes(
        "analytics_storage"
      );

    const adUserData =
      source.includes(
        "ad_user_data"
      );

    const adPersonalization =
      source.includes(
        "ad_personalization"
      );

    const waitForUpdate =
      source.includes(
        "wait_for_update"
      );

    const detected =
      hasDefault ||
      hasUpdate;

    const implementation =
      hasDefault &&
      hasUpdate
        ? "advanced"
        : detected
        ? "basic"
        : "unknown";

    const checks = [
      hasDefault,
      hasUpdate,
      adStorage,
      analyticsStorage,
      adUserData,
      adPersonalization,
      waitForUpdate,
    ];

    const score = Math.round(
      (checks.filter(Boolean)
        .length /
        checks.length) *
        100
    );

    return {
      detected,

      version:
        detected
          ? "v2"
          : "unknown",

      implementation,

      adStorage,

      analyticsStorage,

      adUserData,

      adPersonalization,

      waitForUpdate,

      score,
    };
  }
}

export const consentModeService =
  new ConsentModeService();