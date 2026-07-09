export type SupportedLanguage =
  | "en"
  | "hi"
  | "as"
  | "bn"
  | "brx"
  | "doi"
  | "gu"
  | "kn"
  | "ks"
  | "gom"
  | "mai"
  | "ml"
  | "mni"
  | "mr"
  | "ne"
  | "or"
  | "pa"
  | "sa"
  | "sat"
  | "sd"
  | "ta"
  | "te"
  | "ur";

export type TranslationDictionary =
  Record<string, string>;

export interface LocalizationProvider {
  readonly language: SupportedLanguage;

  readonly dictionary:
    TranslationDictionary;
}