'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut, Loader2 } from 'lucide-react';

export default function LogoutButton({ className = '' }) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Step 1: Sign out from Supabase Session
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Step 2: Clear cache & redirect to Sign-In
      router.push('/signin/customer');
      router.refresh(); 
    } catch (error) {
      console.error('Logout error:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all disabled:opacity-50 cursor-pointer ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Logging out...</span>
        </>
      ) : (
        <>
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </>
      )}
    </button>
  );
}