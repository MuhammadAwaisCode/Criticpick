// Central place for role/permission checks so pages don't duplicate logic.

export function isSuperAdmin(profile) {
  if (!profile) return false;
  return profile.role === 'admin' || profile.role === 'superadmin';
}

export function isApprovedVendor(vendor) {
  if (!vendor) return false;
  return vendor.account_status === 'approved';
}

export async function getAccount(supabase) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const rawRole = profile?.role || user.user_metadata?.role || 'customer';
  const role = rawRole === 'superadmin' ? 'admin' : rawRole;

  return {
    ...user,
    profile,
    role,
  };
}