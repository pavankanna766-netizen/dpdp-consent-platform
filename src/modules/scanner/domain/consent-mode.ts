export interface ConsentModeResult {
  detected: boolean;

  version: "v2" | "unknown";

  implementation:
    | "advanced"
    | "basic"
    | "unknown";

  adStorage: boolean;

  analyticsStorage: boolean;

  adUserData: boolean;

  adPersonalization: boolean;

  waitForUpdate: boolean;

  score: number;
}