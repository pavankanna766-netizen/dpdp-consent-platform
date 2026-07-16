export interface CookieInventoryItem {
  name: string;

  provider: string;

  category:
    | "necessary"
    | "analytics"
    | "marketing"
    | "preferences"
    | "unknown";

  purpose: string;

  duration: string;

  firstParty: boolean;
}