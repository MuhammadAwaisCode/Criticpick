// Central place for role/permission checks so pages don't duplicate logic.

export function isSuperAdmin(profile) {
  if (!profile) return false;
  return profile.role === 'admin' || profile.role === 'superadmin';
}

export function isApprovedVendor(vendor) {
  if (!vendor) return false;
  return vendor.account_status === 'approved';
}
