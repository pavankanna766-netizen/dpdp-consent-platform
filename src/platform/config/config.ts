import {
  PlatformServices,
  type PlatformServiceName,
} from "@/platform/container/platform-services";

import type { PlatformService } from "@/platform/platform-service";

export class ConfigService
  implements PlatformService
{
  readonly name: PlatformServiceName =
    PlatformServices.CONFIG;

  initialize() {
    console.log(
      "⚙️ Config initialized"
    );
  }

  get(key: string): string {
    const value = process.env[key];

    if (!value) {
      throw new Error(
        `Missing environment variable: ${key}`
      );
    }

    return value;
  }
}

export const configService =
  new ConfigService();