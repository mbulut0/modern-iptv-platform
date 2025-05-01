import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, XtreamCredentials, UserInfo } from '@/types';
import { authenticate } from '@/lib/api/xtream';

interface AuthStore extends AuthState {
  login: (credentials: XtreamCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      credentials: null,
      user: null,
      error: null,
      
      login: async (credentials: XtreamCredentials) => {
        try {
          set({ error: null });
          
          // Authenticate with Xtream API
          const user = await authenticate(credentials);
          
          // Update store with authenticated user
          set({
            isAuthenticated: true,
            credentials,
            user,
            error: null
          });
        } catch (error) {
          set({
            isAuthenticated: false,
            credentials: null,
            user: null,
            error: error instanceof Error ? error.message : 'Authentication failed'
          });
          throw error;
        }
      },
      
      logout: () => {
        set({
          isAuthenticated: false,
          credentials: null,
          user: null,
          error: null
        });
      },
      
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        credentials: state.credentials,
        user: state.user
      })
    }
  )
);