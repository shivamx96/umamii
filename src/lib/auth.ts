import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  phone?: string
}

export interface ProfileData {
  name: string
  username: string
  bio?: string
  preferences?: string[]
}

// Email authentication with magic link
export const signInWithMagicLink = async (email: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  
  if (error) {
    console.error('Magic link sign-in error:', error)
    throw new Error(error.message)
  }
  
  return data
}

// Email authentication with OTP
export const signInWithEmailOtp = async (email: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      shouldCreateUser: true,
    },
  })
  
  if (error) {
    console.error('Email OTP sign-in error:', error)
    throw new Error(error.message)
  }
  
  return data
}

// Verify email OTP
export const verifyEmailOtp = async (email: string, token: string) => {
  const { data, error } = await supabase.auth.verifyOtp({
    email: email,
    token: token,
    type: 'email',
  })
  
  if (error) {
    console.error('Email OTP verification error:', error)
    throw new Error(error.message)
  }
  
  return data
}

// Create or update user profile
export const createProfile = async (userData: ProfileData) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('No authenticated user')
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email || '',
      phone_number: user.phone || null,
      name: userData.name,
      username: userData.username,
      bio: userData.bio || null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Profile creation error:', error)
    throw new Error(error.message)
  }

  return data
}

// Get current user profile
export const getCurrentProfile = async (): Promise<ProfileData | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Get profile error:', error)
    return null
  }

  return data as ProfileData
}

// Update user preferences
export const updatePreferences = async (preferences: string[]) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('No authenticated user')
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      preferences: preferences,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Preferences update error:', error)
    throw new Error(error.message)
  }

  return data
}

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Sign out error:', error)
    throw new Error(error.message)
  }
}

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null)
  })
}

// Check if username is available
export const checkUsernameAvailability = async (username: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "not found" which means username is available
    console.error('Username check error:', error)
    throw new Error(error.message)
  }

  return !data // If no data, username is available
}

// Upload profile picture to Supabase Storage
export const uploadProfilePicture = async (file: File): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('No authenticated user')
  }

  // Generate file path: {user_id}/profile.{extension}
  const fileExt = file.name.split('.').pop()
  const filePath = `${user.id}/profile.${fileExt}`

  // Upload file to storage
  const { data, error } = await supabase.storage
    .from('profile-pictures')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true, // Replace existing file
    })

  if (error) {
    console.error('Profile picture upload error:', error)
    throw new Error(error.message)
  }

  // Get public URL for the uploaded file
  const { data: urlData } = supabase.storage
    .from('profile-pictures')
    .getPublicUrl(data.path)

  return urlData.publicUrl
}

// Update profile with picture URL
export const updateProfilePicture = async (profilePictureUrl: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('No authenticated user')
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      profile_picture_url: profilePictureUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Profile picture update error:', error)
    throw new Error(error.message)
  }

  return data
}

// Delete profile picture
export const deleteProfilePicture = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('No authenticated user')
  }

  // Get current profile to find existing picture
  const profile = await getCurrentProfile()
  
  if (profile?.profile_picture_url) {
    // Extract file path from URL
    const url = new URL(profile.profile_picture_url)
    const pathParts = url.pathname.split('/')
    const filePath = pathParts.slice(-2).join('/') // user_id/profile.ext

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('profile-pictures')
      .remove([filePath])

    if (storageError) {
      console.error('Storage deletion error:', storageError)
    }
  }

  // Remove URL from profile
  const { data, error } = await supabase
    .from('profiles')
    .update({
      profile_picture_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Profile picture removal error:', error)
    throw new Error(error.message)
  }

  return data
}

// Get user recommendations with restaurant data
export const getUserRecommendations = async (userId?: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('No authenticated user')
  }

  // Use provided userId or current user's ID
  const targetUserId = userId || user.id

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

// Get user's friends
export const getFriends = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('No authenticated user')
  }

  // Get friend relationships where current user is either user_id OR friend_id
  const { data: friendships, error: friendshipsError } = await supabase
    .from('friends')
    .select('*')
    .or(`and(user_id.eq.${user.id},status.eq.accepted),and(friend_id.eq.${user.id},status.eq.accepted)`)

  if (friendshipsError) {
    console.error('Get friendships error:', friendshipsError)
    throw new Error(friendshipsError.message)
  }

  if (!friendships || friendships.length === 0) {
    return []
  }

  // Extract friend IDs (the other person in each relationship)
  const friendIds = friendships.map(friendship => {
    return friendship.user_id === user.id ? friendship.friend_id : friendship.user_id
  })

  // Get friend profiles
  const { data: friendProfiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', friendIds)

  if (profilesError) {
    console.error('Get friend profiles error:', profilesError)
    throw new Error(profilesError.message)
  }

  // Combine the data
  const friendsWithProfiles = friendships.map(friendship => {
    const friendId = friendship.user_id === user.id ? friendship.friend_id : friendship.user_id
    return {
      ...friendship,
      friend: friendProfiles?.find(profile => profile.id === friendId)
    }
  })

  return friendsWithProfiles
}

// Get sent friend requests
export const getSentRequests = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('No authenticated user')
  }

  // Get friend requests sent by current user
  const { data: requests, error: requestsError } = await supabase
    .from('friends')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (requestsError) {
    console.error('Get sent requests error:', requestsError)
    throw new Error(requestsError.message)
  }

  if (!requests || requests.length === 0) {
    return []
  }

  // Get recipient profiles
  const recipientIds = requests.map(r => r.friend_id)
  const { data: recipientProfiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', recipientIds)

  if (profilesError) {
    console.error('Get recipient profiles error:', profilesError)
    throw new Error(profilesError.message)
  }

  // Combine the data
  const requestsWithProfiles = requests.map(request => ({
    ...request,
    recipient: recipientProfiles?.find(profile => profile.id === request.friend_id)
  }))

  return requestsWithProfiles
}

// Get pending friend requests (received)
export const getPendingRequests = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('No authenticated user')
  }

  // First get the friend requests
  const { data: requests, error: requestsError } = await supabase
    .from('friends')
    .select('*')
    .eq('friend_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (requestsError) {
    console.error('Get requests error:', requestsError)
    throw new Error(requestsError.message)
  }

  if (!requests || requests.length === 0) {
    return []
  }

  // Get requester profiles
  const requesterIds = requests.map(r => r.user_id)
  const { data: requesterProfiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', requesterIds)

  if (profilesError) {
    console.error('Get requester profiles error:', profilesError)
    throw new Error(profilesError.message)
  }

  // Combine the data
  const requestsWithProfiles = requests.map(request => ({
    ...request,
    requester: requesterProfiles?.find(profile => profile.id === request.user_id)
  }))

  return requestsWithProfiles
}

// Send friend request
export const sendFriendRequest = async (friendId: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('No authenticated user')
  }

  // Check if a friendship already exists (in either direction)
  const { data: existingFriendship } = await supabase
    .from('friends')
    .select('*')
    .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
    .maybeSingle()

  if (existingFriendship) {
    throw new Error('Friend request already exists or you are already friends')
  }

  const { data, error } = await supabase
    .from('friends')
    .insert({
      user_id: user.id,
      friend_id: friendId,
      status: 'pending'
    })
    .select()
    .single()

  if (error) {
    console.error('Send friend request error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    throw new Error(error.message)
  }

  return data
}

// Accept friend request
export const acceptFriendRequest = async (requestId: string) => {
  const { data, error } = await supabase
    .from('friends')
    .update({ status: 'accepted' })
    .eq('id', requestId)
    .select()
    .single()

  if (error) {
    console.error('Accept friend request error:', error)
    throw new Error(error.message)
  }

  return data
}

// Decline friend request
export const declineFriendRequest = async (requestId: string) => {
  const { error } = await supabase
    .from('friends')
    .delete()
    .eq('id', requestId)

  if (error) {
    console.error('Decline friend request error:', error)
    throw new Error(error.message)
  }
}

// Remove friend
export const removeFriend = async (friendshipId: string) => {
  const { error } = await supabase
    .from('friends')
    .delete()
    .eq('id', friendshipId)

  if (error) {
    console.error('Remove friend error:', error)
    throw new Error(error.message)
  }
}

// Get friend suggestions (users with similar preferences)
export const getFriendSuggestions = async (limit: number = 10) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('No authenticated user')
  }

  try {
    // First get all existing friend relationships for this user (both directions)
    const { data: existingRelationships, error: friendsError } = await supabase
      .from('friends')
      .select('user_id, friend_id')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)

    if (friendsError) {
      console.error('Get existing relationships error:', friendsError)
    }

    // Create a set of user IDs to exclude (existing friends/requests + current user)
    const excludeUserIds = new Set([user.id])
    
    if (existingRelationships) {
      existingRelationships.forEach(rel => {
        if (rel.user_id === user.id) {
          excludeUserIds.add(rel.friend_id)
        } else {
          excludeUserIds.add(rel.user_id)
        }
      })
    }

    // Get all user profiles except excluded ones
    const excludeIds = Array.from(excludeUserIds)
    const { data: availableProfiles, error } = await supabase
      .from('profiles')
      .select('id, name, username, bio, profile_picture_url, preferences, friends_count, recommendations_count, created_at')
      .not('id', 'in', `(${excludeIds.map(id => `"${id}"`).join(',')})`)
      .limit(limit * 2) // Get more than needed for sorting

    if (error) {
      console.error('Get available profiles error:', error)
      throw new Error(error.message)
    }

    if (!availableProfiles || availableProfiles.length === 0) {
      return []
    }

    // Sort by activity (recommendations count + friends count)
    const sortedSuggestions = availableProfiles
      .sort((a, b) => 
        ((b.recommendations_count || 0) + (b.friends_count || 0)) - 
        ((a.recommendations_count || 0) + (a.friends_count || 0))
      )
      .slice(0, limit)

    return sortedSuggestions
  } catch (error) {
    console.error('Get friend suggestions error:', error)
    return [] // Return empty array instead of throwing to prevent page crash
  }
}