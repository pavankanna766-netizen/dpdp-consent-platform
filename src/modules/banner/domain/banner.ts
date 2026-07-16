export type BannerStatus =
  | "draft"
  | "published";

export type BannerTheme =
  | "light"
  | "dark";

export type BannerLayout =
  | "classic"
  | "modern"
  | "minimal";

export interface CookieBanner {
  id: string;

  companyId: string;

  name: string;

  status: BannerStatus;

  version: number;

  position:
    | "top"
    | "bottom"
    | "floating";

  theme: BannerTheme;

  layout: BannerLayout;

  primaryColor: string;

  language: string;

  showLogo: boolean;

  showReject: boolean;

  showPreferences: boolean;

  consentExpiryDays: number;

  embedToken: string | null;
}