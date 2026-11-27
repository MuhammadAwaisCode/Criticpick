import { getAccount, portalHome } from '../permissions';

export async function signIn(supabase, email, password, expectedRole) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  try {
    const account = await getAccount(supabase);
    if (!account || account.role !== expectedRole) {
      throw new Error('This account does not have access to this portal.');
    }
    return portalHome(account.role);
  } catch (error) {
    await supabase.auth.signOut({ scope: 'local' });
    throw error;
  }
}
