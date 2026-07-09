import type {
  SupportedLanguage,
} from "./types";

const supportedLanguages: SupportedLanguage[] = [
  "en",
  "hi",
  "as",
  "bn",
  "brx",
  "doi",
  "gu",
  "kn",
  "ks",
  "gom",
  "mai",
  "ml",
  "mni",
  "mr",
  "ne",
  "or",
  "pa",
  "sa",
  "sat",
  "sd",
  "ta",
  "te",
  "ur",
];

export function getBrowserLanguage(): SupportedLanguage {
  if (typeof navigator === "undefined") {
    return "en";
  }

  const language =
    navigator.language
      .split("-")[0]
      .toLowerCase();

  if (
    supportedLanguages.includes(
      language as SupportedLanguage
    )
  ) {
    return language as SupportedLanguage;
  }

  return "en";
}