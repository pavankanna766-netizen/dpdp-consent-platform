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
      /gtag\s*\(\s*['"]consent['"]\s*,\s*['"]default['"]/i.test(source) ||
      /['"]consent['"]\s*,\s*['"]default['"]/i.test(source);

    const hasUpdate =
      /gtag\s*\(\s*['"]consent['"]\s*,\s*['"]update['"]/i.test(source) ||
      /['"]consent['"]\s*,\s*['"]update['"]/i.test(source);

    const adStorage =
      /ad_storage\s*:\s*['"]granted['"]/i.test(source) ||
      source.includes("ad_storage");

    const analyticsStorage =
      /analytics_storage\s*:\s*['"]granted['"]/i.test(source) ||
      source.includes("analytics_storage");

    const adUserData =
      /ad_user_data\s*:\s*['"]granted['"]/i.test(source) ||
      source.includes("ad_user_data");

    const adPersonalization =
      /ad_personalization\s*:\s*['"]granted['"]/i.test(source) ||
      source.includes("ad_personalization");

    const waitForUpdate =
      source.includes("wait_for_update");

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