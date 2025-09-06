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
    <div className="w-full h-[400px] bg-card/80 backdrop-blur-lg border-border/50 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
        <p className="text-white/80 text-sm">Loading map...</p>
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
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);

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
    <div className="min-h-screen px-4 pt-6 pb-6">
      {/* Header */}
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Discover</h1>
            <p className="text-muted-foreground">Find great food near you</p>
          </div>
          <Button variant="ghost" size="icon">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search restaurants or cuisine"
            className="pl-12 py-6 text-base"
          />
          <svg 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        {/* City Selector */}
        <div className="flex items-center space-x-3">
          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
          </svg>
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bangalore">Bangalore, India</SelectItem>
              <SelectItem value="mumbai">Mumbai, India</SelectItem>
              <SelectItem value="delhi">Delhi, India</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Interactive Map */}
      <Card className="p-4 mb-8">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Restaurants Near You</h3>
          <p className="text-muted-foreground text-sm">Tap any pin to see details</p>
        </div>
        <OlaMap 
          restaurants={recommendations.map(rec => rec.restaurant)}
          onRestaurantClick={(restaurant) => {
            const recommendation = recommendations.find(r => r.restaurantId === restaurant.id);
            if (recommendation) {
              setSelectedRecommendation(recommendation);
            }
          }}
        />
      </Card>

      {/* Restaurant Recommendations */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold px-2">Nearby Recommendations</h2>
        
        {recommendations.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              <div className="w-12 h-12 bg-muted rounded-2xl mx-auto"></div>
              <div className="h-4 bg-muted rounded-lg mx-auto w-3/4"></div>
              <div className="h-3 bg-muted rounded-lg mx-auto w-1/2"></div>
            </div>
          </Card>
        ) : (
          recommendations.map((recommendation) => (
            <Card key={recommendation.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">
                    {recommendation.restaurant.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    {recommendation.restaurant.address}
                  </p>
                  
                  {/* Cuisine Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {recommendation.cuisine.map((cuisine) => (
                      <Badge 
                        key={cuisine}
                        variant="secondary"
                      >
                        {cuisine}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(recommendation.restaurant.rating || 0) ? 'text-yellow-400' : 'text-muted-foreground'}`}
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-muted-foreground text-sm">
                      {recommendation.restaurant.rating}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Personal Note */}
              <Card className="bg-muted/50 p-4 mb-4">
                <p className="text-sm leading-relaxed">
                  {recommendation.personalNote}
                </p>
              </Card>
              
              {/* User Info */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-secondary-foreground">
                    {recommendation.user.name.charAt(0)}
                  </span>
                </div>
                <span className="text-muted-foreground text-sm">
                  Recommended by {recommendation.user.name}
                </span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => handleUpvote(recommendation.id)}
                  variant={recommendation.hasUserUpvoted ? "default" : "outline"}
                  size="sm"
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
                </Button>

                <Button
                  onClick={() => handleSave(recommendation.id)}
                  variant="outline"
                  size="sm"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Save
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}