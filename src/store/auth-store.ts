import type { Profile } from '@prisma/client';
import type { User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { fetchProfileAction, signOutAction } from '@/lib/auth/actions';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  setAuth: (user: User | null, profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  refreshAuth: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,

  setAuth: (user, profile) => {
    set({ user, profile, isLoading: false });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  refreshAuth: async () => {
    set({ isLoading: true });
    try {
      const { user, profile } = await fetchProfileAction();
      set({ user, profile, isLoading: false });
    } catch (error) {
      console.error('Failed to refresh auth state:', error);
      set({ user: null, profile: null, isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await signOutAction();
    } catch (error) {
      const isRedirect =
        typeof error === 'object' &&
        error !== null &&
        'digest' in error &&
        String((error as { digest?: string }).digest).startsWith('NEXT_REDIRECT');

      if (isRedirect) {
        set({ user: null, profile: null, isLoading: false });
        throw error;
      }

      console.error('Sign out error:', error);
      set({ isLoading: false });
      throw error;
    }
  },
}));

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const isLoading = useAuthStore((state) => state.isLoading);
  const signOut = useAuthStore((state) => state.signOut);
  const refreshAuth = useAuthStore((state) => state.refreshAuth);

  return {
    user,
    profile,
    isLoading,
    isAuthenticated: Boolean(user),
    signOut,
    refreshAuth,
  };
}
