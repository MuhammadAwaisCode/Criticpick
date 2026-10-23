'use server';

import { createClient } from '@/lib/supabase/server';
import { splitPendingVsApproved } from '@/lib/mlmLogic';

// Helper function to resolve user ID safely from Next.js Auth Session
async function getUserId(providedId) {
  if (
    providedId &&
    providedId !== 'CURRENT_USER_ID' &&
    providedId !== 'null' &&
    providedId !== 'undefined'
  ) {
    return providedId;
  }
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

/* ==========================================================================
   1. DASHBOARD OVERVIEW
   ========================================================================== */
export async function fetchAffiliateDashboardData(affiliateId) {
  try {
    const activeId = await getUserId(affiliateId);
    if (!activeId) return null;

    const supabase = await createClient();

    const [profileRes, linksRes, commsRes] = await Promise.all([
      supabase.from('affiliates').select('*').eq('id', activeId).single(),
      supabase.from('affiliate_links').select('*').eq('affiliate_id', activeId),
      supabase.from('commissions').select('*, orders(*)').eq('affiliate_id', activeId)
    ]);

    const formattedEntries = (commsRes.data || []).map(c => ({
      amount: Number(c.amount) || 0,
      orderCompletedAt: c.created_at,
      isRefunded: c.orders?.status === 'refunded'
    }));

    const payoutStatus = splitPendingVsApproved(formattedEntries, 14);

    return {
      profile: profileRes.data || { name: 'Affiliate Partner', rank: 'BASIC' },
      links: linksRes.data || [],
      commissions: commsRes.data || [],
      stats: {
        pendingBalance: payoutStatus.pendingTotal,
        approvedBalance: payoutStatus.approvedTotal,
        totalEarned: payoutStatus.pendingTotal + payoutStatus.approvedTotal
      }
    };
  } catch (err) {
    console.error('fetchAffiliateDashboardData Error:', err);
    return null;
  }
}

/* ==========================================================================
   2. PROFILE & SETTINGS
   ========================================================================== */
export async function fetchAffiliateProfile(affiliateId) {
  try {
    const activeId = await getUserId(affiliateId);
    if (!activeId) return null;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('affiliates')
      .select('*')
      .eq('id', activeId)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('fetchAffiliateProfile Error:', err);
    return null;
  }
}

export async function updateAffiliateProfile(affiliateId, updateData) {
  try {
    const activeId = await getUserId(affiliateId);
    if (!activeId) return { success: false, error: 'User not authenticated' };

    const supabase = await createClient();
    const { error } = await supabase
      .from('affiliates')
      .update({
        full_name: updateData.fullName,
        phone: updateData.phone,
        country: updateData.country,
        address: updateData.address,
        preferred_payout_method: updateData.preferredPayoutMethod,
        payout_details: updateData.payoutDetails,
        updated_at: new Date().toISOString()
      })
      .eq('id', activeId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/* ==========================================================================
   3. PRODUCT CATALOG & LINK CREATION
   ========================================================================== */
export async function fetchProducts() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('fetchProducts Error:', err);
    return [];
  }
}

export async function createAffiliateLink(affiliateId, productId, subId = '') {
  try {
    const activeId = await getUserId(affiliateId);
    if (!activeId) return { success: false, error: 'User not authenticated' };

    const supabase = await createClient();
    const slug = `prod_${productId}_${Math.random().toString(36).substring(2, 7)}`;
    const destinationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourstore.com'}/products/${productId}?ref=${activeId}${subId ? `&subid=${subId}` : ''}`;

    const { data, error } = await supabase
      .from('affiliate_links')
      .insert([
        {
          affiliate_id: activeId,
          product_id: productId,
          sub_id: subId,
          slug: slug,
          url: destinationUrl,
          clicks: 0
        }
      ])
      .select()
      .single();

    if (error) return { success: false, url: destinationUrl, error: error.message };
    return { success: true, link: data, url: destinationUrl };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/* ==========================================================================
   4. AFFILIATE LINKS MANAGEMENT
   ========================================================================== */
export async function fetchAffiliateLinks(affiliateId) {
  try {
    const activeId = await getUserId(affiliateId);
    if (!activeId) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('affiliate_links')
      .select('*, products(title, price)')
      .eq('affiliate_id', activeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('fetchAffiliateLinks Error:', err);
    return [];
  }
}

/* ==========================================================================
   5. DIRECT REFERRALS & REFERRAL TREE
   ========================================================================== */
export async function fetchDirectReferrals(affiliateId) {
  try {
    const activeId = await getUserId(affiliateId);
    if (!activeId) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('affiliates')
      .select('id, full_name, email, rank, created_at')
      .eq('parent_id', activeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('fetchDirectReferrals Error:', err);
    return [];
  }
}

export async function fetchReferralTree(affiliateId) {
  try {
    const activeId = await getUserId(affiliateId);
    if (!activeId) return null;

    const supabase = await createClient();

    const { data: rootProfile } = await supabase
      .from('affiliates')
      .select('id, full_name, rank, sales_volume')
      .eq('id', activeId)
      .single();

    const { data: level1 } = await supabase
      .from('affiliates')
      .select('id, full_name, rank, created_at, sales_volume, parent_id')
      .eq('parent_id', activeId);

    const level1Ids = (level1 || []).map(u => u.id);

    let level2 = [];
    if (level1Ids.length > 0) {
      const { data: l2Data } = await supabase
        .from('affiliates')
        .select('id, full_name, rank, created_at, sales_volume, parent_id')
        .in('parent_id', level1Ids);
      level2 = l2Data || [];
    }

    const buildChildren = (parentId, roleName, commRate) => {
      const childrenList = parentId === activeId ? (level1 || []) : level2.filter(child => child.parent_id === parentId);

      return childrenList.map(child => ({
        id: child.id,
        name: child.full_name || 'Partner',
        role: roleName,
        joined: new Date(child.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        commissionRate: commRate,
        salesVolume: `$${(child.sales_volume || 0).toLocaleString()}`,
        avatar: child.full_name ? child.full_name.slice(0, 2).toUpperCase() : 'AF',
        children: parentId === activeId ? buildChildren(child.id, 'Tier 2 Sub-Partner', '0.5% Override') : []
      }));
    };

    return {
      id: 'node-root',
      name: rootProfile?.full_name || 'You',
      role: rootProfile?.rank || 'Master Partner',
      salesVolume: `$${(rootProfile?.sales_volume || 0).toLocaleString()}`,
      avatar: 'YOU',
      children: buildChildren(activeId, 'Tier 1 Partner', '1% Override')
    };
  } catch (err) {
    console.error('fetchReferralTree Error:', err);
    return null;
  }
}

/* ==========================================================================
   6. COMMISSIONS, PAYOUTS & ANALYTICS
   ========================================================================== */
export async function fetchCommissionsLog(affiliateId) {
  try {
    const activeId = await getUserId(affiliateId);
    if (!activeId) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('commissions')
      .select('*, products(title)')
      .eq('affiliate_id', activeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('fetchCommissionsLog Error:', err);
    return [];
  }
}

export async function fetchCommissionsHistory(affiliateId) {
  return fetchCommissionsLog(affiliateId);
}

export async function fetchPayoutHistory(affiliateId) {
  try {
    const activeId = await getUserId(affiliateId);
    if (!activeId) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('payouts')
      .select('*')
      .eq('affiliate_id', activeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('fetchPayoutHistory Error:', err);
    return [];
  }
}

export async function requestPayout(affiliateId, amount, method, details) {
  try {
    const activeId = await getUserId(affiliateId);
    if (!activeId) return { success: false, error: 'User not authenticated' };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('payouts')
      .insert([
        {
          affiliate_id: activeId,
          amount: amount,
          status: 'PENDING',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, payout: data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function fetchAnalyticsData(affiliateId) {
  try {
    const activeId = await getUserId(affiliateId);
    if (!activeId) return null;

    const supabase = await createClient();
    const [linksRes, commsRes] = await Promise.all([
      supabase.from('affiliate_links').select('*').eq('affiliate_id', activeId),
      supabase.from('commissions').select('*').eq('affiliate_id', activeId)
    ]);

    const totalClicks = (linksRes.data || []).reduce((acc, item) => acc + (item.clicks || 0), 0);
    const totalCommissions = (commsRes.data || []).reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

    return {
      totalClicks,
      totalCommissions,
      linksCount: linksRes.data?.length || 0
    };
  } catch (err) {
    console.error('fetchAnalyticsData Error:', err);
    return null;
  }
}