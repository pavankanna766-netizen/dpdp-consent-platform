import type {
  ConsentEvidencePolicy,
} from "@/platform/consent/evidence-policy";

import type {
  SupportedLanguage,
} from "@/platform/localization";

export interface BannerSettings {
  theme:
    | "light"
    | "dark";

  position:
    | "top"
    | "bottom";

  defaultLanguage:
    SupportedLanguage;
}

export interface BrandingSettings {
  primaryColor: string;

  logo: string | null;
}

export interface CompanySettings {
  consent:
    ConsentEvidencePolicy;

  banner:
    BannerSettings;

  branding:
    BrandingSettings;
}