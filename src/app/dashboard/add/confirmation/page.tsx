'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConfirmationPage() {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti animation
    setShowConfetti(true);
    
    // Auto redirect after 3 seconds unless user interacts
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleViewOnMap = () => {
    router.push('/dashboard');
  };

  const handleViewFeed = () => {
    router.push('/dashboard/feed');
  };

  const handleAddAnother = () => {
    router.push('/dashboard/add');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 animate-bounce rounded-full ${
                i % 4 === 0 ? 'bg-orange-500' : 
                i % 4 === 1 ? 'bg-green-500' : 
                i % 4 === 2 ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-sm w-full text-center z-10">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Recommendation Posted!
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Your food recommendation has been shared with your friends and added to the map. Thank you for helping the community discover great food!
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleViewOnMap}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>View on Map</span>
          </button>

          <button
            onClick={handleViewFeed}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <span>View in Feed</span>
          </button>

          <button
            onClick={handleAddAnother}
            className="w-full bg-white border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 text-gray-700 hover:text-orange-700 font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add Another Recommendation</span>
          </button>
        </div>

        {/* Achievement Badge */}
        <div className="mt-8 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-lg">🏆</span>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Foodie Badge Earned!</h3>
              <p className="text-sm text-gray-600">You&apos;ve shared your first recommendation</p>
            </div>
          </div>
        </div>

        {/* Auto redirect notice */}
        <p className="mt-6 text-xs text-gray-500">
          Redirecting to map in a few seconds...
        </p>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      
      {/* Food Emojis Floating */}
      <div className="absolute top-20 left-10 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>🍕</div>
      <div className="absolute top-32 right-12 text-2xl animate-bounce" style={{ animationDelay: '1s' }}>🍜</div>
      <div className="absolute bottom-40 left-16 text-2xl animate-bounce" style={{ animationDelay: '1.5s' }}>🍔</div>
      <div className="absolute bottom-32 right-20 text-2xl animate-bounce" style={{ animationDelay: '2s' }}>🍰</div>
    </div>
  );
}