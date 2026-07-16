export const PlatformEvents = {
  COMPANY_CREATED: "company.created",

  TEMPLATE_CREATED: "template.created",
  TEMPLATE_UPDATED: "template.updated",
  TEMPLATE_DELETED: "template.deleted",
  TEMPLATE_PUBLISHED: "template.published",

  CONSENT_CREATED: "consent.created",
  CONSENT_ACCEPTED: "consent.accepted",
  CONSENT_REJECTED: "consent.rejected",
  CONSENT_UPDATED: "consent.updated",
  CONSENT_WITHDRAWN: "consent.withdrawn",
  CONSENT_PREFERENCE_CHANGED: "consent.preference_changed",
  CONSENT_POLICY_REACCEPTED: "consent.policy_reaccepted",
  BANNER_DISPLAYED: "banner.displayed",
  BANNER_CREATED: "banner.created",
  BANNER_UPDATED: "banner.updated",
  BANNER_PUBLISHED: "banner.published",

  REQUEST_CREATED: "request.created",
  REQUEST_COMPLETED: "request.completed",

  POLICY_CREATED: "policy.created",
  POLICY_PUBLISHED: "policy.published",
} as const;

export type PlatformEventType =
  (typeof PlatformEvents)[keyof typeof PlatformEvents];
