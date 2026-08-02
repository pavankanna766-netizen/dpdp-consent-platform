export type OrgRole =
  | "owner"
  | "admin"
  | "compliance_manager"
  | "legal_counsel"
  | "developer"
  | "viewer"
  | "auditor";

const ROLE_HIERARCHY: Record<OrgRole, number> = {
  owner: 7,
  admin: 6,
  compliance_manager: 5,
  legal_counsel: 4,
  developer: 3,
  auditor: 2,
  viewer: 1,
};

export function hasMinRole(userRole: OrgRole, requiredRole: OrgRole): boolean {
  return (ROLE_HIERARCHY[userRole] || 1) >= (ROLE_HIERARCHY[requiredRole] || 1);
}

export const PERMISSIONS = {
  // Company & Organization Management
  "company.update": "admin" as OrgRole,
  "company.delete": "owner" as OrgRole,
  "company.members.manage": "admin" as OrgRole,
  "company.members.invite": "admin" as OrgRole,
  "company.ownership.transfer": "owner" as OrgRole,

  // Document Studio & Legal Approvals
  "policy.create": "legal_counsel" as OrgRole,
  "policy.publish": "legal_counsel" as OrgRole,
  "policy.view": "viewer" as OrgRole,
  "approval.sign": "legal_counsel" as OrgRole,

  // Privacy Scanner
  "scanner.run": "compliance_manager" as OrgRole,
  "scanner.view": "viewer" as OrgRole,

  // Data Inventory & Vendors
  "inventory.manage": "compliance_manager" as OrgRole,
  "inventory.view": "viewer" as OrgRole,
  "vendor.manage": "compliance_manager" as OrgRole,
  "vendor.view": "viewer" as OrgRole,

  // DSAR & Consent
  "dsar.view": "viewer" as OrgRole,
  "dsar.fulfill": "compliance_manager" as OrgRole,
  "consent.view": "viewer" as OrgRole,

  // API Keys & Developer Options
  "api_keys.manage": "developer" as OrgRole,
  "webhooks.manage": "developer" as OrgRole,

  // Billing & Subscriptions
  "billing.manage": "owner" as OrgRole,
  "billing.view": "admin" as OrgRole,

  // Audit Logs & Security
  "audit.view": "auditor" as OrgRole,

  // Branding & Settings
  "branding.manage": "admin" as OrgRole,
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function checkPermission(userRole: OrgRole, permission: Permission): boolean {
  const requiredRole = PERMISSIONS[permission];
  return hasMinRole(userRole, requiredRole);
}
