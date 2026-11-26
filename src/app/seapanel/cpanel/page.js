import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { isSuperAdmin } from '@/lib/permissions';

export default async function CPanelPage() {
  const supabase = await createClient();

  // 1. Check user login status
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin/customer');
  }

  // 2. Fetch role from database
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  // 3. Agar Super Admin NAHI hai to Home Page par bhej do (Access Denied)
  if (!isSuperAdmin(profile)) {
    redirect('/');
  }

  // 4. Agar Super Admin hai, to /superadmin page par bhej do
  redirect('/superadmin');
}