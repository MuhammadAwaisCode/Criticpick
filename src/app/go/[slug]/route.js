
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const supabase = await createClient();

    // RPC handles click counting + returning target URL securely
    const { data, error } = await supabase.rpc('resolve_affiliate_link', {
      p_slug: slug
    });

    if (error || !data || data.length === 0 || !data[0].target_url) {
   
      return NextResponse.redirect(new URL('/', request.url));
    }

    const targetUrl = data[0].target_url;


    return NextResponse.redirect(new URL(targetUrl, request.url));
  } catch (err) {
    console.error('Affiliate link redirect error:', err);
    return NextResponse.redirect(new URL('/', request.url));
  }
}