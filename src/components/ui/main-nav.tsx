'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  TvIcon, 
  FilmIcon, 
  MonitorPlayIcon, 
  UserIcon, 
  SettingsIcon 
} from 'lucide-react';

const navItems = [
  {
    name: 'Live TV',
    href: '/live',
    icon: TvIcon
  },
  {
    name: 'Movies',
    href: '/movies',
    icon: FilmIcon
  },
  {
    name: 'Series',
    href: '/series',
    icon: MonitorPlayIcon
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: UserIcon
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: SettingsIcon
  }
];

export function MainNav() {
  const pathname = usePathname();
  
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center text-sm font-medium transition-colors hover:text-primary relative px-3 py-2",
              isActive
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="w-5 h-5 mr-2" />
            <span>{item.name}</span>
            {isActive && (
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 w-full bg-primary"
                layoutId="navbar-indicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}