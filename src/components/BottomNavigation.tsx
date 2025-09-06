'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: (isActive: boolean) => React.ReactElement;
}

const navigationItems: NavItem[] = [
  {
    id: 'map',
    label: 'Map',
    path: '/dashboard',
    icon: (isActive) => (
      <svg 
        className={`w-6 h-6 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} 
        fill={isActive ? 'currentColor' : 'none'} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={isActive ? 0 : 2} 
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
        />
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={isActive ? 0 : 2} 
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
        />
      </svg>
    ),
  },
  {
    id: 'feed',
    label: 'Feed',
    path: '/dashboard/feed',
    icon: (isActive) => (
      <svg 
        className={`w-6 h-6 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} 
        fill={isActive ? 'currentColor' : 'none'} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={isActive ? 0 : 2} 
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" 
        />
      </svg>
    ),
  },
  {
    id: 'add',
    label: 'Add',
    path: '/dashboard/add',
    icon: (isActive) => (
      <div className={`w-12 h-12 rounded-full ${isActive ? 'bg-orange-500' : 'bg-orange-500'} flex items-center justify-center shadow-lg`}>
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
    ),
  },
  {
    id: 'friends',
    label: 'Friends',
    path: '/dashboard/friends',
    icon: (isActive) => (
      <svg 
        className={`w-6 h-6 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} 
        fill={isActive ? 'currentColor' : 'none'} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={isActive ? 0 : 2} 
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
        />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profile',
    path: '/dashboard/profile',
    icon: (isActive) => (
      <svg 
        className={`w-6 h-6 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} 
        fill={isActive ? 'currentColor' : 'none'} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={isActive ? 0 : 2} 
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
        />
      </svg>
    ),
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="bg-white/90 backdrop-blur-2xl border-t border-white/50 shadow-2xl">
        <div className="flex items-center justify-around py-3 px-4">
          {navigationItems.map((item) => {
            const isActive = pathname === item.path || 
              (item.path === '/dashboard' && pathname === '/dashboard') ||
              (item.path !== '/dashboard' && pathname?.startsWith(item.path));
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 tap-target transform ${
                  item.id === 'add' 
                    ? 'scale-110 -translate-y-2' 
                    : isActive 
                      ? 'scale-105 bg-white/20' 
                      : 'hover:scale-105 hover:bg-white/10'
                }`}
                aria-label={item.label}
              >
                <div className={`mb-1 ${item.id === 'add' ? 'mb-0' : ''}`}>
                  {item.icon(isActive)}
                </div>
                {item.id !== 'add' && (
                  <span 
                    className={`text-xs font-medium transition-colors duration-300 ${
                      isActive ? 'text-orange-500' : 'text-gray-600'
                    }`}
                  >
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}