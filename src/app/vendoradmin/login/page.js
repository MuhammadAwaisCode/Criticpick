'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function VendorAdminLoginRedirect() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          router.replace('/vendoradmin/profile');
        } else {
          router.replace('/signin/vendor');
        }
      } catch (err) {
        console.error('Auth check error:', err);
        router.replace('/signin/vendor');
      }
    }

    checkAuth();
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-3" />
      <p className="text-sm font-semibold text-gray-700">Redirecting to Vendor Portal...</p>
    </div>
  );
}
