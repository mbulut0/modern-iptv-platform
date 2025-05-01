'use client';

import { useEffect } from 'react';
import { MainNav } from '@/components/ui/main-nav';
import { UserMenu } from '@/components/ui/user-menu';
import { useAuthStore } from '@/lib/store/auth-store';
import { useContentStore } from '@/lib/store/content-store';
import { Toaster } from '@/components/ui/sonner';
import { useTheme } from 'next-themes';
import { useSettingsStore } from '@/lib/store/settings-store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { credentials } = useAuthStore();
  const { 
    fetchLiveCategories, 
    fetchMovieCategories, 
    fetchSeriesCategories 
  } = useContentStore();
  const { theme } = useSettingsStore();
  const { setTheme } = useTheme();
  
  // Set theme based on user settings
  useEffect(() => {
    if (theme) {
      setTheme(theme);
    }
  }, [theme, setTheme]);
  
  // Fetch initial content data when dashboard loads
  useEffect(() => {
    if (credentials) {
      // Fetch categories for all content types
      fetchLiveCategories(credentials).catch(console.error);
      fetchMovieCategories(credentials).catch(console.error);
      fetchSeriesCategories(credentials).catch(console.error);
    }
  }, [credentials, fetchLiveCategories, fetchMovieCategories, fetchSeriesCategories]);
  
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <div className="font-bold text-xl">IPTV Platform</div>
          </div>
          <div className="flex items-center justify-between w-full">
            <MainNav />
            <UserMenu />
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        {children}
      </main>
      <Toaster />
    </div>
  );
}