'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return; // Wait for auth state to load
    
    if (user) {
      // User is authenticated
      if (profile && profile.name && profile.username) {
        // Profile is complete, redirect to dashboard
        router.replace('/dashboard');
      } else {
        // Profile needs setup
        router.replace('/auth/profile-setup');
      }
    } else {
      // User is not authenticated, redirect to welcome
      router.replace('/welcome');
    }
  }, [router, user, profile, loading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
  );
}
