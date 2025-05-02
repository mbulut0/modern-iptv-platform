'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { initializeFromStorage, isAuthenticated } = useAuthStore();
  
  // Initialize auth from localStorage on client side
  useEffect(() => {
    console.log('StoreProvider: Initializing auth from storage');
    initializeFromStorage();
    
    // Log the auth state after initialization
    setTimeout(() => {
      console.log('StoreProvider: Auth state after initialization:', { 
        isAuthenticated: useAuthStore.getState().isAuthenticated,
        hasUser: !!useAuthStore.getState().user,
        hasCredentials: !!useAuthStore.getState().credentials
      });
    }, 100);
  }, [initializeFromStorage]);
  
  return <>{children}</>;
}