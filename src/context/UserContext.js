'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setUser(null);
        setRole('guest');
        setLoading(false);
        return;
      }

      setUser(user);

      // 1. Pehle user_roles table se check karein
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('roles(name)')
        .eq('user_id', user.id)
        .maybeSingle();

      if (roleData?.roles?.name) {
        setRole(roleData.roles.name); // e.g. 'superadmin'
      } else {
        // 2. Fallback: Profiles table se role read karein
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        setRole(profile?.role || 'customer');
      }

      setLoading(false);
    }

    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{ user, role, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);