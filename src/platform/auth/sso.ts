export type SSOProvider = "entra_id" | "google_workspace" | "okta" | "ping_identity" | "generic_saml";

export interface SSOConfigRecord {
  company_id: string;
  provider: SSOProvider;
  enabled: boolean;
  issuer_url: string;
  sso_url: string;
  certificate: string;
  attribute_mapping: {
    email: string;
    firstName: string;
    lastName: string;
    roles: string;
  };
  scim_enabled: boolean;
  scim_endpoint_url?: string;
  created_at: string;
  updated_at: string;
}

export function buildSAMLAuthRequestUrl(config: SSOConfigRecord, relayState?: string): string {
  const params = new URLSearchParams({
    SAMLRequest: `mock_saml_request_payload_${Date.now()}`,
    RelayState: relayState || "/",
  });
  return `${config.sso_url}?${params.toString()}`;
}

export function parseSCIMUserPayload(payload: Record<string, unknown>): {
  email: string;
  firstName: string;
  lastName: string;
  active: boolean;
} {
  const nameObj = (payload.name as Record<string, string>) || {};
  const emailsArr = (payload.emails as Array<{ value: string; primary?: boolean }>) || [];
  const primaryEmail = emailsArr.find((e) => e.primary)?.value || emailsArr[0]?.value || "";

  return {
    email: primaryEmail,
    firstName: nameObj.givenName || "",
    lastName: nameObj.familyName || "",
    active: payload.active !== false,
  };
}
