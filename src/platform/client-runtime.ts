import type { PlatformService } from "./platform-service";

import { consentEngine } from "./consent";
import { localizationEngine } from "./localization/engine";

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

    console.log(
      "🚀 Client Platform initialized"
    );
  }
}

export const clientPlatformRuntime =
  new ClientPlatformRuntime();