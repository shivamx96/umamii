'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createProfile, checkUsernameAvailability, uploadProfilePicture, updateProfilePicture, getCurrentProfile } from '@/lib/backend';
import Image from 'next/image';

export default function ProfileSetupPage() {
  const { user, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    profilePicture: null as File | null,
  });
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');  
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load existing profile data if available
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
      return;
    }
    
    if (!loading && user) {
      loadExistingProfile();
    }
  }, [user, loading, router]);
  
  const loadExistingProfile = async () => {
    try {
      const profile = await getCurrentProfile();
      if (profile) {
        setIsEditMode(true);
        setFormData({
          name: profile.name || '',
          username: profile.username || '', 
          bio: profile.bio || '',
          profilePicture: null,
        });
        if (profile.profile_picture_url) {
          setProfilePictureUrl(profile.profile_picture_url);
        }
        setUsernameAvailable(true); // Existing username is valid
      }
    } catch (error) {
      console.error('Failed to load existing profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Show loading if auth is loading or profile is loading
  if (loading || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Show nothing if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Check username availability
    if (name === 'username' && value.length >= 3) {
      checkUsernameAsync(value);
    } else if (name === 'username') {
      setUsernameAvailable(null);
    }
  };

  const checkUsernameAsync = async (username: string) => {
    setIsCheckingUsername(true);
    try {
      // Get current profile to check if this is the user's existing username
      const currentProfile = await getCurrentProfile();
      const isCurrentUsername = currentProfile?.username === username;
      
      if (isCurrentUsername) {
        // User's existing username is always valid
        setUsernameAvailable(true);
      } else {
        const isAvailable = await checkUsernameAvailability(username);
        setUsernameAvailable(isAvailable);
      }
    } catch (err) {
      console.error('Username check error:', err);
      setUsernameAvailable(null);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, profilePicture: 'Please select an image file' }));
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, profilePicture: 'Image size must be less than 5MB' }));
      return;
    }

    setFormData(prev => ({ ...prev, profilePicture: file }));
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfilePictureUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Clear error
    setErrors(prev => ({ ...prev, profilePicture: '' }));
  };

  const handleRemoveProfilePicture = () => {
    setFormData(prev => ({ ...prev, profilePicture: null }));
    setProfilePictureUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setErrors(prev => ({ ...prev, profilePicture: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Name must be 50 characters or less';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 20) {
      newErrors.username = 'Username must be 20 characters or less';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    } else if (usernameAvailable === false) {
      newErrors.username = 'Username is already taken';
    } else if (usernameAvailable === null && formData.username.length >= 3) {
      newErrors.username = 'Please wait while we check username availability';
    }

    if (formData.bio.length > 150) {
      newErrors.bio = 'Bio must be 150 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Create profile with backend
      await createProfile({
        name: formData.name,
        username: formData.username,
        bio: formData.bio || undefined,
      });
      
      // Handle profile picture upload if file is selected
      if (formData.profilePicture) {
        try {
          const profilePictureUrl = await uploadProfilePicture(formData.profilePicture);
          await updateProfilePicture(profilePictureUrl);
        } catch (uploadError) {
          console.error('Profile picture upload error:', uploadError);
          // Continue without profile picture if upload fails
          setErrors({ 
            profilePicture: 'Profile created successfully, but profile picture upload failed. You can add it later.' 
          });
        }
      }
      
      if (isEditMode) {
        router.push('/dashboard/profile');
      } else {
        router.push('/auth/preferences');
      }
    } catch (err: unknown) {
      console.error('Profile creation error:', err);
      setErrors({ 
        general: err instanceof Error ? err.message : 'Failed to create profile. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-6 py-8">
      <div className="max-w-md mx-auto w-full">
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isEditMode ? 'Edit your profile' : 'Create your profile'}
            </h1>
            <p className="text-gray-600">
              {isEditMode ? 'Update your profile information' : 'Let others know who you are'}
            </p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {profilePictureUrl ? (
                  <Image
                    src={profilePictureUrl}
                    alt="Profile preview"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={profilePictureUrl ? "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
                </svg>
              </button>
              {profilePictureUrl && (
                <button
                  type="button"
                  onClick={handleRemoveProfilePicture}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Optional - Add a profile picture
              </p>
              {profilePictureUrl && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-orange-500 hover:text-orange-600 font-medium mt-1"
                >
                  Change picture
                </button>
              )}
            </div>
            {errors.profilePicture && (
              <p className="text-sm text-red-600">{errors.profilePicture}</p>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Choose a unique username"
                  className={`w-full px-4 py-3 pr-10 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 ${
                    errors.username ? 'border-red-300 bg-red-50' : 
                    usernameAvailable === true ? 'border-green-300 bg-green-50' :
                    usernameAvailable === false ? 'border-red-300 bg-red-50' :
                    'border-gray-200'
                  }`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isCheckingUsername ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                  ) : usernameAvailable === true ? (
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : usernameAvailable === false ? (
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : null}
                </div>
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
              {usernameAvailable === true && (
                <p className="mt-1 text-sm text-green-600">Username is available!</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell others about yourself (optional)"
                rows={3}
                maxLength={150}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none ${
                  errors.bio ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.bio && (
                  <p className="text-sm text-red-600">{errors.bio}</p>
                )}
                <p className="text-sm text-gray-500 ml-auto">
                  {formData.bio.length}/150
                </p>
              </div>
            </div>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLoading || !formData.name || !formData.username || usernameAvailable === false}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating Profile...</span>
                </div>
              ) : (
                isEditMode ? 'Save Changes' : 'Continue'
              )}
            </button>

          </div>
        </form>
        </div>
      </div>
    </div>
  );
}