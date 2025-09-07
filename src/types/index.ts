// Database types from Supabase
export interface ProfileData {
  id: string;
  email: string;
  name: string;
  username: string;
  bio: string | null;
  profile_picture_url: string | null;
  preferences: string[];
  friends_count: number;
  recommendations_count: number;
  created_at: string;
  updated_at: string;
}

// Frontend display user type (cleaned up from database format)
export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  bio?: string;
  profilePicture?: string;
  preferences: FoodPreference[];
  friendsCount: number;
  recommendationsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  cuisine: string[];
  rating?: number;
  priceLevel?: number;
  googlePlaceId?: string;
  zomatoId?: string;
}

// User recommendation from database
export interface UserRecommendation {
  id: string;
  restaurant_id: string;
  user_id: string;
  type: string[];
  cuisine: string[];
  personal_note: string;
  photos: string[];
  upvotes: number;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  restaurant: {
    id: string;
    name: string;
    address: string;
    cuisine: string[];
    rating?: number;
  };
}

// Frontend recommendation interface
export interface Recommendation {
  id: string;
  restaurantId: string;
  restaurant: Restaurant;
  userId: string;
  user: User;
  type: RecommendationType[];
  cuisine: string[];
  personalNote: string;
  photos: string[];
  upvotes: number;
  hasUserUpvoted: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FriendRequest {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
  requester: Friend;
}

// Legacy interface for backward compatibility
export interface FriendRequestLegacy {
  id: string;
  fromUserId: string;
  fromUser: User;
  toUserId: string;
  toUser: User;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'friend_request' | 'map_suggestion' | 'upvote' | 'comment';
  title: string;
  message: string;
  data: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

export interface Comment {
  id: string;
  recommendationId: string;
  userId: string;
  user: User;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MapSuggestion {
  id: string;
  recommendationId: string;
  recommendation: Recommendation;
  fromUserId: string;
  fromUser: User;
  toUserId: string;
  toUser: User;
  status: 'pending' | 'approved' | 'declined';
  createdAt: Date;
  updatedAt: Date;
}

export type RecommendationType = 
  | 'veg' 
  | 'vegan' 
  | 'street_food' 
  | 'cafe' 
  | 'fine_dining' 
  | 'casual_dining' 
  | 'fast_food' 
  | 'dessert' 
  | 'bar' 
  | 'bakery';

export type FoodPreference = 
  | 'street_food'
  | 'italian'
  | 'korean'
  | 'chinese'
  | 'indian'
  | 'mexican'
  | 'japanese'
  | 'thai'
  | 'mediterranean'
  | 'american'
  | 'french'
  | 'vegan'
  | 'vegetarian'
  | 'spicy'
  | 'sweet'
  | 'healthy'
  | 'comfort_food'
  | 'dessert'
  | 'casual_dining'
  | 'south_indian';

// Friend relationship types
export interface Friend {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  profile_picture_url: string | null;
  friends_count: number;
  recommendations_count: number;
  created_at: string;
}

export interface FriendshipData {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
  friend: Friend;
}

export interface UserProfile extends User {
  friends: User[];
  recommendations: Recommendation[];
  savedRecommendations: Recommendation[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface MapPin {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  recommendation: Recommendation;
  type: RecommendationType;
}

export interface FeedItem {
  id: string;
  type: 'recommendation' | 'friend_joined' | 'achievement';
  recommendation?: Recommendation;
  user: User;
  createdAt: Date;
}

export interface SearchResult {
  restaurants: Restaurant[];
  users: User[];
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: ApiError;
}