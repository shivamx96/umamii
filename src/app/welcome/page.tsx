'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function WelcomePage() {
  const [isAnimated, setIsAnimated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    router.push('/auth/login');
  };

  return (
    <div className="screen-container flex flex-col items-center justify-center relative">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-8 w-16 h-16 bg-gradient-to-br from-orange-400/30 to-orange-500/30 rounded-full animate-bounce" />
        <div className="absolute top-40 right-12 w-12 h-12 bg-gradient-to-br from-green-400/25 to-green-500/25 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-40 left-16 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-purple-500/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-60 right-8 w-14 h-14 bg-gradient-to-br from-blue-400/30 to-blue-500/30 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className={`content-container flex flex-col items-center text-center transition-all duration-1000 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Main Content Card */}
        <Card className="bg-card/80 backdrop-blur-lg border-border/50 shadow-2xl p-8 w-full mb-12">
          {/* App Logo */}
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-lg flex items-center justify-center mb-4 mx-auto">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            
            {/* Food Icons around logo */}
            <div className="absolute -top-2 -right-6 w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-sm shadow-lg">
              🍕
            </div>
            <div className="absolute -bottom-2 -left-6 w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white text-sm shadow-lg">
              🍜
            </div>
          </div>

          {/* App Name & Tagline */}
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight drop-shadow-lg">
            umamii
          </h1>
          <p className="text-xl text-white/90 mb-8 leading-relaxed drop-shadow-md">
            Food that fits your palate
          </p>

          {/* Features Preview */}
          <div className="space-y-4 w-full mb-8">
            <Card className="bg-card/50 backdrop-blur-md border-border/50 shadow-lg hover:shadow-xl hover:bg-card/70 hover:-translate-y-1 transition-all duration-300 flex items-center space-x-4 p-4 text-left">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white drop-shadow-md">Discover on Map</h3>
                <p className="text-sm text-white/80">Find restaurants near you</p>
              </div>
            </Card>

            <Card className="bg-card/50 backdrop-blur-md border-border/50 shadow-lg hover:shadow-xl hover:bg-card/70 hover:-translate-y-1 transition-all duration-300 flex items-center space-x-4 p-4 text-left">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white drop-shadow-md">Share with Friends</h3>
                <p className="text-sm text-white/80">Get trusted recommendations</p>
              </div>
            </Card>

            <Card className="bg-card/50 backdrop-blur-md border-border/50 shadow-lg hover:shadow-xl hover:bg-card/70 hover:-translate-y-1 transition-all duration-300 flex items-center space-x-4 p-4 text-left">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white drop-shadow-md">Save Favorites</h3>
                <p className="text-sm text-white/80">Build your personal food map</p>
              </div>
            </Card>
          </div>
        </Card>

        {/* Get Started Button */}
        <Button
          onClick={handleGetStarted}
          size="lg"
          className="w-full max-w-sm bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-8 shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}