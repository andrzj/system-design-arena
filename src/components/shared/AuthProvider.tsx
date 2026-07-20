'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const refreshAuth = useAuthStore((state) => state.refreshAuth);
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const supabase = createClient();

    void refreshAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setAuth(null, null);
        return;
      }

      await refreshAuth();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshAuth, setAuth]);

  useEffect(() => {
    void refreshAuth();
  }, [pathname, refreshAuth]);

  return <>{children}</>;
}
