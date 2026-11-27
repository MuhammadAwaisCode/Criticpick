import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/profile';

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name, options) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: vendor } = await supabase
          .from('vendors')
          .select('account_status')
          .eq('user_id', user.id)
          .maybeSingle();
        if (vendor && vendor.account_status !== 'approved') {
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/signin/vendor?error=pending_admin`);
        }
        if (vendor && vendor.account_status === 'approved') {
          return NextResponse.redirect(`${origin}/vendoradmin/profile`);
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/signin?error=auth-failed`);
}