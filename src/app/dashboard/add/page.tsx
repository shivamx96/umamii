'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Restaurant } from '@/types';

// Mock restaurant data for search
const mockRestaurants: Restaurant[] = [
  {
    id: 'rest1',
    name: 'Bangalore Thali',
    address: 'Koramangala 5th Block, Bangalore',
    location: { latitude: 12.9352, longitude: 77.6245 },
    cuisine: ['Indian', 'South Indian'],
    rating: 4.5,
    priceLevel: 2,
  },
  {
    id: 'rest2',
    name: 'Seoul Kitchen',
    address: 'Indiranagar 100 Feet Road, Bangalore',
    location: { latitude: 12.9719, longitude: 77.6412 },
    cuisine: ['Korean'],
    rating: 4.3,
    priceLevel: 3,
  },
  {
    id: 'rest3',
    name: 'Pizza Corner',
    address: 'MG Road, Bangalore',
    location: { latitude: 12.9716, longitude: 77.5946 },
    cuisine: ['Italian', 'Fast Food'],
    rating: 4.1,
    priceLevel: 2,
  },
  {
    id: 'rest4',
    name: 'Taco Bell',
    address: 'Brigade Road, Bangalore',
    location: { latitude: 12.9698, longitude: 77.6205 },
    cuisine: ['Mexican', 'Fast Food'],
    rating: 3.9,
    priceLevel: 2,
  },
  {
    id: 'rest5',
    name: 'Sushi Yama',
    address: 'UB City Mall, Bangalore',
    location: { latitude: 12.9721, longitude: 77.6069 },
    cuisine: ['Japanese', 'Sushi'],
    rating: 4.4,
    priceLevel: 4,
  },
];

export default function AddRecommendationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Restaurant[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    
    // Simulate API search delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const filtered = mockRestaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
      restaurant.address.toLowerCase().includes(query.toLowerCase()) ||
      restaurant.cuisine.some(c => c.toLowerCase().includes(query.toLowerCase()))
    );
    
    setSearchResults(filtered);
    setShowResults(true);
    setIsSearching(false);
  };

  const handleRestaurantSelect = (restaurant: Restaurant) => {
    // Navigate to recommendation details with restaurant data
    router.push(`/dashboard/add/details?restaurantId=${restaurant.id}&name=${encodeURIComponent(restaurant.name)}&address=${encodeURIComponent(restaurant.address)}`);
  };

  const handleManualAdd = () => {
    router.push('/dashboard/add/manual');
  };

  const getPriceLevel = (level: number) => {
    return '$'.repeat(level);
  };

  const getStarRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 20 20">
            <defs>
              <linearGradient id="half">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path fill="url(#half)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={i} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 safe-area-top">
        <div className="px-4 py-4 flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Add Recommendation</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Search Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Search for a restaurant
          </h2>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by restaurant name, location, or cuisine"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            />
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
              </div>
            )}
          </div>

          {/* Search Results */}
          {showResults && (
            <div className="space-y-3">
              {searchResults.length > 0 ? (
                <>
                  <p className="text-sm text-gray-600 mb-3">
                    Found {searchResults.length} restaurant{searchResults.length !== 1 ? 's' : ''}
                  </p>
                  {searchResults.map((restaurant) => (
                    <button
                      key={restaurant.id}
                      onClick={() => handleRestaurantSelect(restaurant)}
                      className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200 text-left"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {restaurant.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {restaurant.address}
                          </p>
                          
                          {/* Cuisine Tags */}
                          <div className="flex flex-wrap gap-2 mb-2">
                            {restaurant.cuisine.map((cuisine) => (
                              <span 
                                key={cuisine}
                                className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium"
                              >
                                {cuisine}
                              </span>
                            ))}
                          </div>
                          
                          {/* Rating and Price */}
                          <div className="flex items-center space-x-4">
                            {getStarRating(restaurant.rating!)}
                            {restaurant.priceLevel && (
                              <span className="text-sm text-gray-600 font-medium">
                                {getPriceLevel(restaurant.priceLevel)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-gray-600 mb-2">No restaurants found</p>
                  <p className="text-sm text-gray-500">Try adjusting your search or add manually</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-4 text-sm text-gray-500 bg-gray-50">or</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        {/* Manual Add Section */}
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Can&apos;t find your restaurant?
          </h2>
          <p className="text-gray-600 mb-4">
            Add it manually by dropping a pin on the map
          </p>
          
          <button
            onClick={handleManualAdd}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Drop Pin Manually</span>
          </button>
        </div>

        {/* Popular Restaurants Section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Popular in your area
          </h2>
          
          <div className="grid grid-cols-1 gap-3">
            {mockRestaurants.slice(0, 3).map((restaurant) => (
              <button
                key={restaurant.id}
                onClick={() => handleRestaurantSelect(restaurant)}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-200 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {restaurant.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {restaurant.address}
                    </p>
                    
                    <div className="flex items-center space-x-2">
                      {getStarRating(restaurant.rating!)}
                    </div>
                  </div>
                  
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}