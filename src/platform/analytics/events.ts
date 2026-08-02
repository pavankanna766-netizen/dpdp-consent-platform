export type AnalyticsEventName =
  | "company_created"
  | "onboarding_started"
  | "onboarding_completed"
  | "sdk_generated"
  | "sdk_connected"
  | "first_scan_started"
  | "first_scan_completed"
  | "vendor_added"
  | "data_inventory_created"
  | "consent_template_published"
  | "cookie_banner_published"
  | "trust_center_published"
  | "legal_document_generated"
  | "dsar_submitted"
  | "dsar_completed"
  | "team_member_invited"
  | "api_key_created"
  | "billing_subscription_started"
  | "billing_upgraded"
  | "billing_cancelled";

export interface AnalyticsEventPayload {
  companyId: string;
  userId?: string;
  properties?: Record<string, unknown>;
}
