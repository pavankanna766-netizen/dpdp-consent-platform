import { consentRegistry } from "./registry";

import type { PlatformService } from "../platform-service";

import type {
  ConsentCategory,
  ConsentDecision,
  ConsentEngine,
  ConsentState,
} from "./types";

export class DefaultConsentEngine
  implements ConsentEngine, PlatformService
{
    readonly name = "consent-engine";
  initialize() {
    console.log(
      "🍪 ConsentEngine initialized"
    );
  }

  getState(): ConsentState {
  return consentRegistry.getState();
}

  grant(
    category: ConsentCategory
  ) {
    consentRegistry.update(
      category,
      "granted"
    );
  }

  deny(
    category: ConsentCategory
  ) {
    consentRegistry.update(
      category,
      "denied"
    );
  }

  reset() {
    consentRegistry.reset();
  }
}

export const consentEngine =
  new DefaultConsentEngine();