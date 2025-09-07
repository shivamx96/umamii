import { supabase } from '../supabase'
import {searchRestaurants} from "@/lib/backend";

// Search users by name or username
export const searchUsers = async (query: string, limit: number = 10) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('No authenticated user')
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, username, bio, profile_picture_url, friends_count, recommendations_count, created_at')
    .or(`name.ilike.%${query}%,username.ilike.%${query}%`)
    .neq('id', user.id) // Exclude current user
    .limit(limit)

  if (error) {
    console.error('User search error:', error)
    throw new Error(error.message)
  }

  return data
}

// Combined search for users and restaurants
export const searchAll = async (query: string) => {
  try {
    const [users, restaurants] = await Promise.all([
      searchUsers(query, 5),
      searchRestaurants(query, 5)
    ])

    return {
      users,
      restaurants
    }
  } catch (error) {
    console.error('Combined search error:', error)
    throw new Error('Search failed')
  }
}