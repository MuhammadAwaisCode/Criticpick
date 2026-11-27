'use server';

import { createClient } from '@/lib/supabase/server';

export async function fetchMarketingAssets(providedUserId) {
  try {
    const supabase = await createClient();

    // Safe User ID resolution (Fallback to current auth session)
    let userId = providedUserId;
    if (!userId || userId === 'CURRENT_USER_ID' || userId === 'null' || userId === 'undefined') {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    }

    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    // 1. Fetch SubID Tracking Campaigns
    const { data: subidData, error: subidError } = await supabase
      .from('affiliate_subid_stats')
      .select('sub_id, clicks, sales, total_revenue, commission')
      .eq('user_id', userId);

    if (subidError) throw subidError;

    // Format subid records for frontend table
    const formattedCampaigns = (subidData || []).map((item) => {
      const clicks = Number(item.clicks) || 0;
      const sales = Number(item.sales) || 0;
      const convRate = clicks > 0 ? ((sales / clicks) * 100).toFixed(1) + '%' : '0.0%';

      return {
        subId: item.sub_id,
        clicks: clicks,
        sales: sales,
        conversionRate: convRate,
        totalRevenue: `$${(Number(item.total_revenue) || 0).toFixed(2)}`,
        commission: `$${(Number(item.commission) || 0).toFixed(2)}`,
      };
    });

    // 2. Fetch Active Promotional Banners
    const { data: bannersData, error: bannersError } = await supabase
      .from('marketing_banners')
      .select('id, title, category, size, image_url, target_url')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (bannersError) throw bannersError;

    const formattedBanners = (bannersData || []).map((b) => ({
      id: b.id,
      title: b.title,
      category: b.category || 'General',
      size: b.size || '300x250',
      imageUrl: b.image_url,
      targetUrl: b.target_url ? `${b.target_url}?ref=${userId}` : `#`,
    }));

    // 3. Fetch Assigned Promo Codes
    const { data: couponsData, error: couponsError } = await supabase
      .from('affiliate_coupons')
      .select('code, usage_count, discount, description')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (couponsError) throw couponsError;

    const formattedCoupons = (couponsData || []).map((c) => ({
      code: c.code,
      usageCount: `${c.usage_count || 0} uses`,
      discount: c.discount,
      description: c.description,
    }));

    return {
      success: true,
      data: {
        campaigns: formattedCampaigns,
        banners: formattedBanners,
        coupons: formattedCoupons,
      },
    };
  } catch (err) {
    console.error('Server Action Error (fetchMarketingAssets):', err);
    return {
      success: false,
      error: 'Failed to fetch marketing assets from the database.',
    };
  }
}