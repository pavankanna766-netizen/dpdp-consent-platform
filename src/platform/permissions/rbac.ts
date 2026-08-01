export type OrgRole = 'owner' | 'admin' | 'viewer';

const ROLE_HIERARCHY: Record<OrgRole, number> = {
  owner: 3,
  admin: 2,
  viewer: 1,
};

/**
 * Check if a role has at least the required permission level.
 */
export function hasMinRole(userRole: OrgRole, requiredRole: OrgRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Permission matrix: maps actions to minimum required role.
 */
export const PERMISSIONS = {
  // Company management
  'company.update': 'owner' as OrgRole,
  'company.delete': 'owner' as OrgRole,
  'company.members.manage': 'owner' as OrgRole,
  
  // Consent templates
  'template.create': 'admin' as OrgRole,
  'template.update': 'admin' as OrgRole,
  'template.publish': 'owner' as OrgRole,
  'template.view': 'viewer' as OrgRole,
  
  // Consent records
  'consent.view': 'viewer' as OrgRole,
  'consent.withdraw': 'admin' as OrgRole,
  
  // DSAR
  'dsar.view': 'viewer' as OrgRole,
  'dsar.fulfill': 'admin' as OrgRole,
  'dsar.reject': 'admin' as OrgRole,
  
  // Policies
  'policy.create': 'admin' as OrgRole,
  'policy.publish': 'owner' as OrgRole,
  'policy.view': 'viewer' as OrgRole,
  
  // Scanner
  'scanner.run': 'admin' as OrgRole,
  'scanner.view': 'viewer' as OrgRole,
  
  // Billing
  'billing.manage': 'owner' as OrgRole,
  'billing.view': 'admin' as OrgRole,
  
  // Audit
  'audit.view': 'viewer' as OrgRole,
  
  // Settings
  'settings.update': 'owner' as OrgRole,
  'settings.view': 'viewer' as OrgRole,
  
  // Banner
  'banner.create': 'admin' as OrgRole,
  'banner.update': 'admin' as OrgRole,
  'banner.view': 'viewer' as OrgRole,
  
  // Breach incidents
  'breach.create': 'admin' as OrgRole,
  'breach.view': 'viewer' as OrgRole,
  
  // Vendor/Inventory
  'vendor.manage': 'admin' as OrgRole,
  'vendor.view': 'viewer' as OrgRole,
  'inventory.manage': 'admin' as OrgRole,
  'inventory.view': 'viewer' as OrgRole,
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function checkPermission(userRole: OrgRole, permission: Permission): boolean {
  const requiredRole = PERMISSIONS[permission];
  return hasMinRole(userRole, requiredRole);
}
