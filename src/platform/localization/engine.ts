import type {
  PlatformService,
} from "../platform-service";

import { logger } from "@/platform/logger";

import {
  localizationRegistry,
} from "./registry";

import {
  englishProvider,
} from "./languages/en";

import type {
  SupportedLanguage,
} from "./types";

export class LocalizationEngine
  implements PlatformService
{
  readonly name =
    "localization-engine";

  initialize() {
    localizationRegistry.register(
      englishProvider
    );

    logger.info(
  "LocalizationEngine initialized"
);
  }

  t(
    key: string,
    language: SupportedLanguage = "en"
  ) {
    const provider =
      localizationRegistry.get(
        language
      );

    if (!provider) {
      return key;
    }

    return (
      provider.dictionary[key] ??
      key
    );
  }
}

export const localizationEngine =
  new LocalizationEngine();