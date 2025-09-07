'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function WelcomePage() {
  const [isAnimated, setIsAnimated] = useState(false);
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading) return; // Wait for auth state to load
    
    if (user) {
      // User is authenticated, redirect appropriately
      if (profile && profile.name && profile.username) {
        router.replace('/dashboard');
      } else {
        router.replace('/auth/profile-setup');
      }
    }
  }, [user, profile, loading, router]);

  const handleGetStarted = () => {
    router.push('/auth/login');
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: 'url(/9154788.jpg)' }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className={`min-h-screen flex flex-col justify-between items-center px-6 py-8 relative z-10 transition-all duration-1000 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Empty top spacer */}
        <div></div>
        
        {/* App Name - Centered */}
        <div className="flex-1 flex items-center justify-center">
          <h1 className="text-6xl font-bold tracking-tight text-white drop-shadow-lg">
            umamii
          </h1>
        </div>

        {/* Get Started Button - Bottom */}
        <div className="w-full max-w-sm">
          <button
            onClick={handleGetStarted}
            className="w-full font-semibold py-4 px-8 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors shadow-lg"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}