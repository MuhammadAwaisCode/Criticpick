import { redirect } from 'next/navigation';
import { getAccount } from './permissions';
import { createClient } from './supabase/server';

const signIn = { admin: '/signin?role=admin', vendor: '/signin/vendor', customer: '/signin/customer', affiliate: '/signin/affiliater' };

export async function guardPortal(role) {
  const account = await getAccount(createClient());
  if (!account) redirect(signIn[role] || '/signin');
  if (role !== 'account' && account.role !== role) redirect('/');
}
