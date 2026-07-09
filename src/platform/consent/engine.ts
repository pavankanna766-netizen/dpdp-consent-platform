import { consentRegistry } from "./registry";

import type { PlatformService } from "../platform-service";

import { logger } from "@/platform/logger";

import type {
  ConsentCategory,
  ConsentEngine,
  ConsentState,
} from "./types";

export class DefaultConsentEngine
  implements ConsentEngine, PlatformService
{
    readonly name = "consent-engine";
  initialize() {
    logger.info(
  "ConsentEngine initialized"
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