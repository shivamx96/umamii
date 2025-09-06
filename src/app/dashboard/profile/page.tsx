'use client';

import { useState, useEffect } from 'react';
import { User, Recommendation } from '@/types';

// Mock current user data
const mockCurrentUser: User = {
  id: 'current_user',
  name: 'Alex Johnson',
  username: 'alex_foodie',
  phoneNumber: '+91 9876543210',
  bio: 'Food explorer and photography enthusiast. Always searching for the perfect biryani and authentic street food experiences.',
  preferences: ['indian', 'street_food', 'spicy'],
  friendsCount: 127,
  recommendationsCount: 23,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
};

// Mock user recommendations
const mockRecommendations: Recommendation[] = [
  {
    id: 'rec1',
    restaurantId: 'rest1',
    restaurant: {
      id: 'rest1',
      name: 'Paradise Biryani',
      address: 'Secunderabad, Hyderabad',
      location: { latitude: 17.4399, longitude: 78.4983 },
      cuisine: ['Indian', 'Biryani'],
      rating: 4.6,
    },
    userId: 'current_user',
    user: mockCurrentUser,
    type: ['casual_dining'],
    cuisine: ['Indian', 'Biryani'],
    personalNote: 'Best mutton biryani in Hyderabad! The meat is perfectly cooked and the flavors are incredible. Must try their raita and shorba too.',
    photos: [],
    upvotes: 15,
    hasUserUpvoted: false,
    isApproved: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: 'rec2',
    restaurantId: 'rest2',
    restaurant: {
      id: 'rest2',
      name: 'Ramesh Tiffin Center',
      address: 'Koti, Hyderabad',
      location: { latitude: 17.3616, longitude: 78.4747 },
      cuisine: ['South Indian'],
      rating: 4.2,
    },
    userId: 'current_user',
    user: mockCurrentUser,
    type: ['street_food'],
    cuisine: ['South Indian'],
    personalNote: 'Amazing dosas and filter coffee. This place has been serving authentic breakfast for 40+ years. Try their masala dosa!',
    photos: [],
    upvotes: 8,
    hasUserUpvoted: false,
    isApproved: true,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
  },
  {
    id: 'rec3',
    restaurantId: 'rest3',
    restaurant: {
      id: 'rest3',
      name: 'Pista House',
      address: 'Charminar, Hyderabad',
      location: { latitude: 17.3616, longitude: 78.4747 },
      cuisine: ['Indian', 'Haleem'],
      rating: 4.4,
    },
    userId: 'current_user',
    user: mockCurrentUser,
    type: ['street_food'],
    cuisine: ['Indian', 'Haleem'],
    personalNote: 'Famous for their haleem during Ramadan, but their kebabs are amazing year-round. Historic place with incredible flavors.',
    photos: [],
    upvotes: 12,
    hasUserUpvoted: false,
    isApproved: true,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
];

type ViewMode = 'map' | 'list';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser(mockCurrentUser);
    setRecommendations(mockRecommendations);
    setIsLoading(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatJoinDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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
            <h1 className="text-xl font-bold text-gray-900">Profile</h1>
          </div>
        </div>

        {/* Loading */}
        <div className="p-4">
          <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 safe-area-top">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Profile</h1>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-white">
        <div className="px-4 py-6">
          <div className="flex items-start space-x-4 mb-4">
            {/* Profile Picture */}
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">
                {getInitials(user.name)}
              </span>
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h2>
              <p className="text-gray-600 mb-2">@{user.username}</p>
              
              {/* Stats */}
              <div className="flex space-x-6">
                <div className="text-center">
                  <div className="font-bold text-lg text-gray-900">{user.recommendationsCount}</div>
                  <div className="text-xs text-gray-600">Recommendations</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-gray-900">{user.friendsCount}</div>
                  <div className="text-xs text-gray-600">Friends</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-gray-900">
                    {recommendations.reduce((sum, rec) => sum + rec.upvotes, 0)}
                  </div>
                  <div className="text-xs text-gray-600">Total Upvotes</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bio */}
          {user.bio && (
            <p className="text-gray-700 mb-4 leading-relaxed">{user.bio}</p>
          )}
          
          {/* Join Date */}
          <p className="text-sm text-gray-500">
            Member since {formatJoinDate(user.createdAt)}
          </p>
          
          {/* Edit Profile Button */}
          <button className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-xl transition-colors">
            Edit Profile
          </button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">My Recommendations</h3>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'map'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Map
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {viewMode === 'list' ? (
          <div className="space-y-4">
            {recommendations.length > 0 ? (
              recommendations.map((recommendation) => (
                <div key={recommendation.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {recommendation.restaurant.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
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
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        {recommendation.upvotes}
                      </div>
                      <p className="text-xs text-gray-500">{formatTimeAgo(recommendation.createdAt)}</p>
                    </div>
                  </div>
                  
                  {/* Personal Note */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {recommendation.personalNote}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
                <p className="text-gray-500 mb-4">Start sharing your favorite food spots</p>
                <button className="bg-orange-500 text-white px-6 py-2 rounded-xl font-medium hover:bg-orange-600 transition-colors">
                  Add Recommendation
                </button>
              </div>
            )}
          </div>
        ) : (
          // Map View Placeholder
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Map View</h3>
            <p className="text-gray-600 mb-4">See all your recommendations on an interactive map</p>
            <p className="text-sm text-gray-500">Map integration coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}