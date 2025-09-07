import { supabase } from './supabase'
import type { Database } from '@/types/supabase'

type Tables = Database['public']['Tables']
type RestaurantRow = Tables['restaurants']['Row']
type RecommendationRow = Tables['recommendations']['Row']
type ProfileRow = Tables['profiles']['Row']

// Restaurant operations
export const getRestaurants = async () => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching restaurants:', error)
    throw new Error(error.message)
  }

  return data
}

export const getNearbyRestaurants = async (lat: number, lng: number, radiusKm: number = 5) => {
  const { data, error } = await supabase
    .rpc('nearby_restaurants', {
      lat,
      lng,
      radius_km: radiusKm,
    })

  if (error) {
    console.error('Error fetching nearby restaurants:', error)
    throw new Error(error.message)
  }

  return data
}

export const createRestaurant = async (restaurant: {
  name: string
  address: string
  latitude: number
  longitude: number
  cuisine?: string[]
  rating?: number
  priceLevel?: number
  googlePlaceId?: string
}) => {
  const { data, error } = await supabase
    .from('restaurants')
    .insert({
      name: restaurant.name,
      address: restaurant.address,
      location: `POINT(${restaurant.longitude} ${restaurant.latitude})`,
      cuisine: restaurant.cuisine || [],
      rating: restaurant.rating,
      price_level: restaurant.priceLevel,
      google_place_id: restaurant.googlePlaceId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating restaurant:', error)
    throw new Error(error.message)
  }

  return data
}

// Recommendation operations
export const getRecommendations = async () => {
  const { data, error } = await supabase
    .from('recommendations')
    .select(`
      *,
      restaurant:restaurants(*),
      user:profiles(*)
    `)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching recommendations:', error)
    throw new Error(error.message)
  }

  return data
}

export const getUserRecommendations = async (userId: string) => {
  const { data, error } = await supabase
    .from('recommendations')
    .select(`
      *,
      restaurant:restaurants(*),
      user:profiles(*)
    `)
    .eq('user_id', userId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user recommendations:', error)
    throw new Error(error.message)
  }

  return data
}

export const createRecommendation = async (recommendation: {
  restaurantId: string
  personalNote: string
  type?: string[]
  cuisine?: string[]
  photos?: string[]
}) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('No authenticated user')
  }

  const { data, error } = await supabase
    .from('recommendations')
    .insert({
      restaurant_id: recommendation.restaurantId,
      user_id: user.id,
      personal_note: recommendation.personalNote,
      type: recommendation.type || [],
      cuisine: recommendation.cuisine || [],
      photos: recommendation.photos || [],
    })
    .select(`
      *,
      restaurant:restaurants(*),
      user:profiles(*)
    `)
    .single()

  if (error) {
    console.error('Error creating recommendation:', error)
    throw new Error(error.message)
  }

  return data
}

// Upvote operations
export const toggleUpvote = async (recommendationId: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('No authenticated user')
  }

  // Check if user already upvoted
  const { data: existingUpvote } = await supabase
    .from('recommendation_upvotes')
    .select('*')
    .eq('recommendation_id', recommendationId)
    .eq('user_id', user.id)
    .single()

  if (existingUpvote) {
    // Remove upvote
    const { error } = await supabase
      .from('recommendation_upvotes')
      .delete()
      .eq('recommendation_id', recommendationId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error removing upvote:', error)
      throw new Error(error.message)
    }

    return false // Upvote removed
  } else {
    // Add upvote
    const { error } = await supabase
      .from('recommendation_upvotes')
      .insert({
        recommendation_id: recommendationId,
        user_id: user.id,
      })

    if (error) {
      console.error('Error adding upvote:', error)
      throw new Error(error.message)
    }

    return true // Upvote added
  }
}

export const getUserUpvotes = async (userId?: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  const targetUserId = userId || user?.id
  
  if (!targetUserId) {
    return []
  }

  const { data, error } = await supabase
    .from('recommendation_upvotes')
    .select('recommendation_id')
    .eq('user_id', targetUserId)

  if (error) {
    console.error('Error fetching user upvotes:', error)
    return []
  }

  return data.map(item => item.recommendation_id)
}

// Friend operations
export const getFriends = async (userId?: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  const targetUserId = userId || user?.id
  
  if (!targetUserId) {
    throw new Error('No user specified')
  }

  const { data, error } = await supabase
    .from('friends')
    .select(`
      *,
      friend:profiles!friends_friend_id_fkey(*)
    `)
    .eq('user_id', targetUserId)
    .eq('status', 'accepted')

  if (error) {
    console.error('Error fetching friends:', error)
    throw new Error(error.message)
  }

  return data
}

export const getFriendRequests = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('No authenticated user')
  }

  const { data, error } = await supabase
    .from('friends')
    .select(`
      *,
      from_user:profiles!friends_user_id_fkey(*)
    `)
    .eq('friend_id', user.id)
    .eq('status', 'pending')

  if (error) {
    console.error('Error fetching friend requests:', error)
    throw new Error(error.message)
  }

  return data
}

export const sendFriendRequest = async (friendId: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('No authenticated user')
  }

  const { data, error } = await supabase
    .from('friends')
    .insert({
      user_id: user.id,
      friend_id: friendId,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('Error sending friend request:', error)
    throw new Error(error.message)
  }

  return data
}

export const respondToFriendRequest = async (requestId: string, status: 'accepted' | 'declined') => {
  const { data, error } = await supabase
    .from('friends')
    .update({ status })
    .eq('id', requestId)
    .select()
    .single()

  if (error) {
    console.error('Error responding to friend request:', error)
    throw new Error(error.message)
  }

  return data
}

// Search operations
export const searchUsers = async (query: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`name.ilike.%${query}%,username.ilike.%${query}%`)
    .limit(10)

  if (error) {
    console.error('Error searching users:', error)
    throw new Error(error.message)
  }

  return data
}

export const searchRestaurants = async (query: string) => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .or(`name.ilike.%${query}%,address.ilike.%${query}%`)
    .limit(10)

  if (error) {
    console.error('Error searching restaurants:', error)
    throw new Error(error.message)
  }

  return data
}

// Real-time subscriptions
export const subscribeToRecommendations = (callback: (payload: any) => void) => {
  return supabase
    .channel('recommendations')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'recommendations',
    }, callback)
    .subscribe()
}

export const subscribeToFriendRequests = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('friend-requests')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'friends',
      filter: `friend_id=eq.${userId}`,
    }, callback)
    .subscribe()
}

// Utility functions
export const transformRestaurantRow = (row: RestaurantRow) => ({
  id: row.id,
  name: row.name,
  address: row.address,
  location: {
    latitude: 0, // Will be populated by PostGIS function
    longitude: 0, // Will be populated by PostGIS function
  },
  cuisine: row.cuisine,
  rating: row.rating,
  priceLevel: row.price_level,
  googlePlaceId: row.google_place_id,
  zomatoId: row.zomato_id,
})

export const transformRecommendationRow = (row: any) => ({
  id: row.id,
  restaurantId: row.restaurant_id,
  restaurant: row.restaurant,
  userId: row.user_id,
  user: row.user,
  type: row.type,
  cuisine: row.cuisine,
  personalNote: row.personal_note,
  photos: row.photos,
  upvotes: row.upvotes,
  hasUserUpvoted: false, // Will be determined separately
  isApproved: row.is_approved,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
})