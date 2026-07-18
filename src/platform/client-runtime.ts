import type { PlatformService } from "./platform-service";

import { consentEngine } from "./consent";
import { localizationEngine } from "./localization/engine";

import { logger } from "./logger";

class ClientPlatformRuntime {
  private initialized = false;

  private readonly services: PlatformService[] = [
    consentEngine,
    localizationEngine,
  ];

  initialize() {
    if (this.initialized) {
      return;
    }

    this.initialized = true;

    for (const service of this.services) {
      service.initialize();
    }

    logger.info("Client Platform initialized");
  }
}

export const clientPlatformRuntime =
  new ClientPlatformRuntime();