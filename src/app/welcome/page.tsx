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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className={`max-w-md w-full flex flex-col items-center text-center transition-all duration-1000 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-sm p-8 w-full mb-8">
          {/* App Logo */}
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center mb-4 mx-auto">
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
                  d="M15 11a3 3 0 11-6 0 3 3 0 616 0z"
                />
              </svg>
            </div>
            
            {/* Food Icons around logo */}
            <div className="absolute -top-2 -right-6 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-sm">
              🍕
            </div>
            <div className="absolute -bottom-2 -left-6 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm">
              🍜
            </div>
          </div>

          {/* App Name & Tagline */}
          <h1 className="text-4xl font-bold mb-3 tracking-tight text-gray-900">
            umamii
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Food that fits your palate
          </p>

          {/* Features Preview */}
          <div className="space-y-4 w-full mb-8">
            <div className="border border-gray-200 hover:bg-gray-50 transition-all duration-300 flex items-center space-x-4 p-4 text-left rounded-xl">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Discover on Map</h3>
                <p className="text-sm text-gray-600">Find restaurants near you</p>
              </div>
            </div>

            <div className="border border-gray-200 hover:bg-gray-50 transition-all duration-300 flex items-center space-x-4 p-4 text-left rounded-xl">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Share with Friends</h3>
                <p className="text-sm text-gray-600">Get trusted recommendations</p>
              </div>
            </div>

            <div className="border border-gray-200 hover:bg-gray-50 transition-all duration-300 flex items-center space-x-4 p-4 text-left rounded-xl">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Save Favorites</h3>
                <p className="text-sm text-gray-600">Build your personal food map</p>
              </div>
            </div>
          </div>
        </div>

        {/* Get Started Button */}
        <button
          onClick={handleGetStarted}
          className="w-full max-w-sm font-semibold py-4 px-8 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}