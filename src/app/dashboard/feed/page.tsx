'use client';

import { useState, useEffect } from 'react';
import { Recommendation, FeedItem } from '@/types';

// Mock feed data
const mockFeedItems: FeedItem[] = [
  {
    id: '1',
    type: 'recommendation',
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
    recommendation: {
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
      personalNote: 'Best unlimited thali in Koramangala! Must try their filter coffee. The rasam is absolutely perfect and they have amazing varieties of vegetables. Highly recommended for authentic South Indian experience!',
      photos: [],
      upvotes: 12,
      hasUserUpvoted: false,
      isApproved: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    type: 'recommendation',
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
    recommendation: {
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
      createdAt: new Date('2024-01-14'),
      updatedAt: new Date('2024-01-14'),
    },
    createdAt: new Date('2024-01-14'),
  },
  {
    id: '3',
    type: 'friend_joined',
    user: {
      id: 'user3',
      name: 'Arjun Patel',
      username: 'arjun_eats',
      phoneNumber: '+91 9876543212',
      bio: 'Street food explorer',
      preferences: ['street_food', 'spicy'],
      friendsCount: 25,
      recommendationsCount: 8,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    createdAt: new Date('2024-01-13'),
  },
];

export default function FeedPage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setFeedItems(mockFeedItems);
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleUpvote = (recommendationId: string) => {
    setFeedItems(prev => prev.map(item => {
      if (item.type === 'recommendation' && item.recommendation?.id === recommendationId) {
        const rec = item.recommendation!;
        return {
          ...item,
          recommendation: {
            ...rec,
            upvotes: rec.hasUserUpvoted ? rec.upvotes - 1 : rec.upvotes + 1,
            hasUserUpvoted: !rec.hasUserUpvoted
          }
        };
      }
      return item;
    }));
  };

  const handleAddToMap = (recommendation: Recommendation) => {
    console.log('Adding to map:', recommendation.restaurant.name);
    // TODO: Implement add to map functionality
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 safe-area-top">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900">Feed</h1>
          </div>
        </div>

        {/* Loading Skeleton */}
        <div className="p-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 safe-area-top">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Feed</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg 
              className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Feed Content */}
      <div className="p-4 space-y-4">
        {feedItems.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500 mb-4">Follow friends to see their food recommendations here</p>
            <button className="bg-orange-500 text-white px-6 py-2 rounded-xl font-medium hover:bg-orange-600 transition-colors">
              Find Friends
            </button>
          </div>
        ) : (
          feedItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {item.type === 'recommendation' && item.recommendation && (
                <>
                  {/* Header */}
                  <div className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {item.user.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{item.user.name}</h3>
                          <span className="text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{formatTimeAgo(item.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-600">@{item.user.username}</p>
                      </div>
                    </div>

                    {/* Restaurant Info */}
                    <div className="mb-3">
                      <h4 className="font-bold text-lg text-gray-900 mb-1">
                        {item.recommendation.restaurant.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.recommendation.restaurant.address}
                      </p>
                      
                      {/* Cuisine Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.recommendation.cuisine.map((cuisine) => (
                          <span 
                            key={cuisine}
                            className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium"
                          >
                            {cuisine}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Personal Note */}
                    <div className="bg-gray-50 rounded-xl p-3 mb-4">
                      <p className="text-gray-800 text-sm leading-relaxed">
                        {item.recommendation.personalNote}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-4 pb-4">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleUpvote(item.recommendation!.id)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                          item.recommendation.hasUserUpvoted
                            ? 'bg-orange-100 text-orange-600'
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        <svg className="w-5 h-5" fill={item.recommendation.hasUserUpvoted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        <span className="text-sm">{item.recommendation.upvotes}</span>
                      </button>

                      <button
                        onClick={() => handleAddToMap(item.recommendation!)}
                        className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-600 rounded-lg font-medium hover:bg-green-200 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm">Add to my map</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {item.type === 'friend_joined' && (
                <div className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800">
                        <span className="font-semibold">{item.user.name}</span> joined Umamii
                      </p>
                      <p className="text-sm text-gray-600">Welcome @{item.user.username}!</p>
                    </div>
                    <span className="text-xs text-gray-500">{formatTimeAgo(item.createdAt)}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}