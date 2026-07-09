import type {
  LocalizationProvider,
  SupportedLanguage,
} from "./types";

export class LocalizationRegistry {
  private readonly providers =
    new Map<
      SupportedLanguage,
      LocalizationProvider
    >();

  register(
    provider: LocalizationProvider
  ) {
    this.providers.set(
      provider.language,
      provider
    );
  }

  get(
    language: SupportedLanguage
  ) {
    return this.providers.get(
      language
    );
  }

  has(
    language: SupportedLanguage
  ) {
    return this.providers.has(
      language
    );
  }

  getLanguages() {
    return [
      ...this.providers.keys(),
    ];
  }
}

export const localizationRegistry =
  new LocalizationRegistry();