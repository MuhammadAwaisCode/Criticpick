export type UserRole = 'super_admin' | 'admin' | 'vendor' | 'affiliate' | 'customer';

export interface Profile {
  id: string;
  email?: string;
  role?: UserRole;
}

/**
 * Check if user has Super Admin role
 */
export function isSuperAdmin(profile: Profile | null | undefined): boolean {
  return profile?.role === 'super_admin';
}