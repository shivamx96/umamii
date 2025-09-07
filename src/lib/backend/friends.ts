import { supabase } from '../supabase'

// Get user's friends (bidirectional support)
export const getFriends = async (userId?: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  const targetUserId = userId || user?.id
  
  if (!targetUserId) {
    throw new Error('No user specified')
  }

  // Get friend relationships where current user is either user_id OR friend_id
  const { data: friendships, error: friendshipsError } = await supabase
    .from('friends')
    .select('*')
    .or(`and(user_id.eq.${targetUserId},status.eq.accepted),and(friend_id.eq.${targetUserId},status.eq.accepted)`)

  if (friendshipsError) {
    console.error('Get friendships error:', friendshipsError)
    throw new Error(friendshipsError.message)
  }

  if (!friendships || friendships.length === 0) {
    return []
  }

  // Extract friend IDs (the other person in each relationship)
  const friendIds = friendships.map(friendship => {
    return friendship.user_id === targetUserId ? friendship.friend_id : friendship.user_id
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
    const friendId = friendship.user_id === targetUserId ? friendship.friend_id : friendship.user_id
    return {
      ...friendship,
      friend: friendProfiles?.find(profile => profile.id === friendId)
    }
  })

  return friendsWithProfiles
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