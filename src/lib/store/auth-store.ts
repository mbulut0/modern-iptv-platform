import { create } from 'zustand';
import { AuthState, XtreamCredentials, UserInfo } from '@/types';
import { authenticate } from '@/lib/api/xtream';

interface AuthStore extends AuthState {
  login: (credentials: XtreamCredentials) => Promise<UserInfo>;
  logout: () => void;
  clearError: () => void;
  initializeFromStorage: () => void;
}

// Simple auth store without persist middleware
export const useAuthStore = create<AuthStore>()((set, get) => ({
  isAuthenticated: false,
  credentials: null,
  user: null,
  error: null,
  
  // Initialize from localStorage
  initializeFromStorage: () => {
    if (typeof window === 'undefined') return;
    
    try {
      const storedAuth = localStorage.getItem('auth-data');
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        console.log('Initializing auth from storage:', { 
          hasCredentials: !!authData.credentials,
          hasUser: !!authData.user
        });
        
        set({
          isAuthenticated: true,
          credentials: authData.credentials,
          user: authData.user
        });
      } else {
        console.log('No auth data found in storage');
      }
    } catch (error) {
      console.error('Error initializing from storage:', error);
    }
  },
  
  login: async (credentials: XtreamCredentials) => {
    try {
      console.log('Auth store: login attempt with credentials', credentials);
      set({ error: null });
      
      // Authenticate with Xtream API
      const user = await authenticate(credentials);
      console.log('Auth store: authentication successful, user:', user);
      
      if (!user) {
        throw new Error('Authentication failed: No user data received');
      }
      
      // Validate user data
      if (!user.username || !user.password || !user.status) {
        console.error('Auth store: Invalid user data received', user);
        throw new Error('Authentication failed: Invalid user data');
      }
      
      // Update store with authenticated user
      set({
        isAuthenticated: true,
        credentials,
        user,
        error: null
      });
      
      console.log('Auth store: state updated, isAuthenticated=true');
      
      // Save to localStorage and set a cookie for middleware
      if (typeof window !== 'undefined') {
        // Save detailed data to localStorage
        localStorage.setItem('auth-data', JSON.stringify({
          credentials,
          user
        }));
        
        // Set a simple cookie for middleware authentication check
        document.cookie = `auth-token=true; path=/; max-age=2592000`; // 30 days
        
        console.log('Auth data saved to localStorage and cookie set');
      }
      
      // Return the user for convenience
      return user;
    } catch (error) {
      console.error('Auth store: login failed', error);
      
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
    
    // Clear from localStorage and remove cookie
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-data');
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      console.log('Auth data removed from localStorage and cookie cleared');
    }
  },
  
  clearError: () => {
    set({ error: null });
  }
}));