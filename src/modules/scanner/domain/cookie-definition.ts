import type {
  CookieCategory,
} from "./types";

export interface CookieDefinition {
  pattern: string;

  provider: string;

  category: CookieCategory;

  purpose: string;

  typicalDuration: string;

  consentRequired: boolean;

  party:
    | "first-party"
    | "third-party";
}