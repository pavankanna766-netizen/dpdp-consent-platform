export type IpStorageMode =
  | "none"
  | "hashed"
  | "raw";

export type UserAgentStorageMode =
  | "none"
  | "browser"
  | "full";

export interface ConsentEvidencePolicy {
  ipStorage: IpStorageMode;

  userAgentStorage:
    UserAgentStorageMode;

  storeConsentText: boolean;

  storeLanguage: boolean;

  storeBannerVersion: boolean;

  storePolicyVersion: boolean;

  storePageUrl: boolean;

  storeReferrer: boolean;
}

export const DEFAULT_POLICY: ConsentEvidencePolicy =
{
  ipStorage: "hashed",

  userAgentStorage:
    "browser",

  storeConsentText: true,

  storeLanguage: true,

  storeBannerVersion: true,

  storePolicyVersion: true,

  storePageUrl: true,

  storeReferrer: true,
};