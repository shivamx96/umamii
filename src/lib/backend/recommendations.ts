import { supabase } from '../supabase'

// Get all recommendations
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

// Get user recommendations with restaurant data
export const getUserRecommendations = async (userId?: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user && !userId) {
    throw new Error('No authenticated user')
  }

  // Use provided userId or current user's ID
  const targetUserId = userId || user?.id

  if (!targetUserId) {
    throw new Error('No user ID provided')
  }

  const { data, error } = await supabase
    .from('recommendations')
    .select(`
      *,
      restaurant:restaurants(*)
    `)
    .eq('user_id', targetUserId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Get user recommendations error:', error)
    throw new Error(error.message)
  }

  return data
}

// Create a new recommendation
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

// Toggle upvote for a recommendation
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

// Get user's upvotes
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

// Transform recommendation data from database to frontend format
export const transformRecommendationRow = (row: Record<string, unknown>) => ({
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
  createdAt: new Date(row.created_at as string),
  updatedAt: new Date(row.updated_at as string),
})