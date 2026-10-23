'use server';

import { createClient } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/permissions';

async function requireAdmin(supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'Not authenticated.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!isSuperAdmin(profile)) {
    return { ok: false, error: 'Not authorized.' };
  }

  return { ok: true, user, profile };
}

async function safeSelect(supabase, table, columns = '*') {
  try {
    const { data, error } = await supabase.from(table).select(columns);
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

function mapVendorStatus(accountStatus) {
  switch (accountStatus) {
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'pending_admin':
    default:
      return 'Pending';
  }
}

export async function fetchAdminDashboardData() {
  const supabase = await createClient();

  const auth = await requireAdmin(supabase);
  if (!auth.ok) {
    return null;
  }

  const [profiles, vendors, reviews, categories, inventory, orders, disputes, affiliates, coupons, payouts, gateways, banners] =
    await Promise.all([
      safeSelect(supabase, 'profiles', 'id, full_name, email, role, status'),
      supabase
        .from('vendors')
        .select('id, store_name, email, account_status, created_at')
        .order('created_at', { ascending: false }),
      safeSelect(supabase, 'reviews'),
      safeSelect(supabase, 'categories'),
      safeSelect(supabase, 'inventory'),
      safeSelect(supabase, 'orders'),
      safeSelect(supabase, 'disputes'),
      safeSelect(supabase, 'affiliates'),
      safeSelect(supabase, 'coupons'),
      safeSelect(supabase, 'payouts'),
      safeSelect(supabase, 'payment_gateways'),
      safeSelect(supabase, 'banners'),
    ]);

  const users = (profiles || []).map((p) => ({
    id: p.id,
    name: p.full_name || '—',
    email: p.email,
    role: p.role,
    status: p.status === 'approved' || p.status === 'active' ? 'Active' : 'Pending',
  }));

  const vendorApps = (vendors?.data || []).map((v) => ({
    id: v.id,
    storeName: v.store_name,
    email: v.email,
    status: mapVendorStatus(v.account_status),
  }));

  return {
    users,
    vendorApps,
    reviews,
    categories,
    inventory,
    orders,
    disputes,
    affiliates,
    coupons,
    payouts,
    gateways,
    banners,
  };
}

export async function approveVendorAction(vendorId) {
  const supabase = await createClient();

  const auth = await requireAdmin(supabase);
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  const { error } = await supabase
    .from('vendors')
    .update({
      account_status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: auth.user.id,
    })
    .eq('id', vendorId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function resolveDisputeAction(disputeId) {
  const supabase = await createClient();

  const auth = await requireAdmin(supabase);
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  const { error } = await supabase
    .from('disputes')
    .update({ status: 'Resolved', resolved_at: new Date().toISOString() })
    .eq('id', disputeId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function releasePayoutAction(payoutId) {
  const supabase = await createClient();

  const auth = await requireAdmin(supabase);
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  const { error } = await supabase
    .from('payouts')
    .update({ status: 'Released', released_at: new Date().toISOString() })
    .eq('id', payoutId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
