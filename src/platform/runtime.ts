import { auditEngine } from "./audit";
import type { PlatformService } from "./platform-service";

import { consentEngine } from "./consent";

import { exportEngine } from "./export";

import { localizationEngine } from "./localization/engine";

class PlatformRuntime {
  private initialized = false;

 private readonly services: PlatformService[] = [
  auditEngine,
  exportEngine,
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
      "🚀 PrivyStack Platform initialized"
    );
  }
}

export const platformRuntime =
  new PlatformRuntime();