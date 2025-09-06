'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Recommendation } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const OlaMap = dynamic(() => import('@/components/OlaMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
        <p className="text-gray-600 text-sm">Loading map...</p>
      </div>
    </div>
  )
});

// Mock data for now
const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    restaurantId: 'rest1',
    restaurant: {
      id: 'rest1',
      name: 'Bangalore Thali',
      address: 'Koramangala, Bangalore',
      location: { latitude: 12.9352, longitude: 77.6245 },
      cuisine: ['Indian', 'South Indian'],
      rating: 4.5,
    },
    userId: 'user1',
    user: {
      id: 'user1',
      name: 'Ravi Kumar',
      username: 'ravi_k',
      phoneNumber: '+91 9876543210',
      bio: 'Food lover from Bangalore',
      preferences: ['indian', 'spicy'],
      friendsCount: 42,
      recommendationsCount: 15,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    type: ['casual_dining'],
    cuisine: ['Indian', 'South Indian'],
    personalNote: 'Best unlimited thali in Koramangala! Must try their filter coffee.',
    photos: [],
    upvotes: 12,
    hasUserUpvoted: false,
    isApproved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    restaurantId: 'rest2',
    restaurant: {
      id: 'rest2',
      name: 'Seoul Kitchen',
      address: 'Indiranagar, Bangalore',
      location: { latitude: 12.9719, longitude: 77.6412 },
      cuisine: ['Korean'],
      rating: 4.3,
    },
    userId: 'user2',
    user: {
      id: 'user2',
      name: 'Priya Shah',
      username: 'priya_foodie',
      phoneNumber: '+91 9876543211',
      bio: 'Korean food enthusiast',
      preferences: ['korean', 'spicy'],
      friendsCount: 38,
      recommendationsCount: 22,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    type: ['casual_dining'],
    cuisine: ['Korean'],
    personalNote: 'Authentic Korean BBQ! The kimchi is perfect and the bulgogi melts in your mouth.',
    photos: [],
    upvotes: 8,
    hasUserUpvoted: true,
    isApproved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function DashboardPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedCity, setSelectedCity] = useState('bangalore');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Simulate loading recommendations
    const timer = setTimeout(() => {
      setRecommendations(mockRecommendations);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleUpvote = (recommendationId: string) => {
    setRecommendations(prev => prev.map(rec => 
      rec.id === recommendationId 
        ? {
            ...rec, 
            upvotes: rec.hasUserUpvoted ? rec.upvotes - 1 : rec.upvotes + 1,
            hasUserUpvoted: !rec.hasUserUpvoted
          }
        : rec
    ));
  };

  const handleSave = (recommendationId: string) => {
    console.log('Saving recommendation:', recommendationId);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-6 pb-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
            <p className="text-gray-600">Find great food near you</p>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search restaurants or cuisine"
            className="w-full pl-12 py-3 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
          />
          <svg 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        {/* City Selector */}
        <div className="flex items-center space-x-3">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
          </svg>
          <select 
            value={selectedCity} 
            onChange={(e) => setSelectedCity(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="bangalore">Bangalore, India</option>
            <option value="mumbai">Mumbai, India</option>
            <option value="delhi">Delhi, India</option>
          </select>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-900">Restaurants Near You</h3>
          <p className="text-gray-600 text-sm">Tap any pin to see details</p>
        </div>
        <OlaMap 
          restaurants={recommendations.map(rec => rec.restaurant)}
          onRestaurantClick={(restaurant) => {
            console.log('Restaurant clicked:', restaurant);
          }}
        />
      </div>

      {/* Restaurant Recommendations */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold px-2 text-gray-900">Nearby Recommendations</h2>
        
        {recommendations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="animate-pulse space-y-4">
              <div className="w-12 h-12 bg-gray-300 rounded-2xl mx-auto"></div>
              <div className="h-4 bg-gray-300 rounded-lg mx-auto w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded-lg mx-auto w-1/2"></div>
            </div>
          </div>
        ) : (
          recommendations.map((recommendation) => (
            <div key={recommendation.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1 text-gray-900">
                    {recommendation.restaurant.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {recommendation.restaurant.address}
                  </p>
                  
                  {/* Cuisine Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {recommendation.cuisine.map((cuisine) => (
                      <span 
                        key={cuisine}
                        className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium"
                      >
                        {cuisine}
                      </span>
                    ))}
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(recommendation.restaurant.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-gray-600 text-sm">
                      {recommendation.restaurant.rating}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Personal Note */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm leading-relaxed text-gray-700">
                  {recommendation.personalNote}
                </p>
              </div>
              
              {/* User Info */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-orange-700">
                    {recommendation.user.name.charAt(0)}
                  </span>
                </div>
                <span className="text-gray-600 text-sm">
                  Recommended by {recommendation.user.name}
                </span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleUpvote(recommendation.id)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    recommendation.hasUserUpvoted 
                      ? 'bg-orange-500 text-white hover:bg-orange-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <svg 
                    className="w-5 h-5 mr-2" 
                    fill={recommendation.hasUserUpvoted ? 'currentColor' : 'none'} 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  {recommendation.upvotes}
                </button>

                <button
                  onClick={() => handleSave(recommendation.id)}
                  className="flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Save
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}