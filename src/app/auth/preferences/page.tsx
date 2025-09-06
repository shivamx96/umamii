'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FoodPreference } from '@/types';

const foodPreferences: { value: FoodPreference; label: string; icon: string }[] = [
  { value: 'street_food', label: 'Street Food', icon: '🌮' },
  { value: 'italian', label: 'Italian', icon: '🍝' },
  { value: 'korean', label: 'Korean', icon: '🍜' },
  { value: 'chinese', label: 'Chinese', icon: '🥟' },
  { value: 'indian', label: 'Indian', icon: '🍛' },
  { value: 'mexican', label: 'Mexican', icon: '🌯' },
  { value: 'japanese', label: 'Japanese', icon: '🍣' },
  { value: 'thai', label: 'Thai', icon: '🍲' },
  { value: 'mediterranean', label: 'Mediterranean', icon: '🥙' },
  { value: 'american', label: 'American', icon: '🍔' },
  { value: 'french', label: 'French', icon: '🥐' },
  { value: 'vegan', label: 'Vegan', icon: '🥗' },
  { value: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
  { value: 'spicy', label: 'Spicy', icon: '🌶️' },
  { value: 'sweet', label: 'Sweet', icon: '🍰' },
  { value: 'healthy', label: 'Healthy', icon: '🥑' },
  { value: 'comfort_food', label: 'Comfort Food', icon: '🍕' },
];

export default function PreferencesPage() {
  const [selectedPreferences, setSelectedPreferences] = useState<FoodPreference[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const togglePreference = (preference: FoodPreference) => {
    setSelectedPreferences(prev => 
      prev.includes(preference)
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Simulate API call to save preferences
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push('/dashboard');
    } catch (err) {
      console.log(err);
      console.error('Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-6 py-8">
      <div className="max-w-md mx-auto w-full">
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              What do you love to eat?
            </h1>
            <p className="text-gray-600">
              Choose your food preferences to get better recommendations
            </p>
          </div>

          {/* Preferences Grid */}
          <div className="mb-8">
            <div className="grid grid-cols-2 gap-3">
              {foodPreferences.map((preference) => {
                const isSelected = selectedPreferences.includes(preference.value);
                return (
                  <button
                    key={preference.value}
                    onClick={() => togglePreference(preference.value)}
                    className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-colors ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl">{preference.icon}</span>
                    <div className="flex-1 text-left">
                      <p className={`font-medium ${
                        isSelected ? 'text-orange-900' : 'text-gray-900'
                      }`}>
                        {preference.label}
                      </p>
                    </div>
                    {isSelected && (
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Count */}
          {selectedPreferences.length > 0 && (
            <div className="mb-6 text-center">
              <p className="text-sm text-gray-600">
                {selectedPreferences.length} preference{selectedPreferences.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Saving Preferences...</span>
                </div>
              ) : selectedPreferences.length > 0 ? (
                `Save ${selectedPreferences.length} Preference${selectedPreferences.length !== 1 ? 's' : ''}`
              ) : (
                'Continue'
              )}
            </button>

            <button
              onClick={handleSkip}
              disabled={isLoading}
              className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 px-4 rounded-xl transition-colors"
            >
              Skip for now
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="mt-8 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}