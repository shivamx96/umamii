import { supabase } from '../supabase'
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
  profile_picture_url?: string
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