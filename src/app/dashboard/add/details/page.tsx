'use client';

import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { RecommendationType } from '@/types';

const recommendationTypes: { value: RecommendationType; label: string; icon: string }[] = [
  { value: 'veg', label: 'Vegetarian', icon: '🥗' },
  { value: 'vegan', label: 'Vegan', icon: '🌱' },
  { value: 'street_food', label: 'Street Food', icon: '🌮' },
  { value: 'cafe', label: 'Cafe', icon: '☕' },
  { value: 'fine_dining', label: 'Fine Dining', icon: '🍽️' },
  { value: 'casual_dining', label: 'Casual Dining', icon: '🍛' },
  { value: 'fast_food', label: 'Fast Food', icon: '🍔' },
  { value: 'dessert', label: 'Dessert', icon: '🍰' },
  { value: 'bar', label: 'Bar', icon: '🍸' },
  { value: 'bakery', label: 'Bakery', icon: '🥐' },
];

const cuisineOptions = [
  { region: 'Indian', cuisines: ['North Indian', 'South Indian', 'Bengali', 'Gujarati', 'Punjabi', 'Rajasthani'] },
  { region: 'Asian', cuisines: ['Chinese', 'Japanese', 'Korean', 'Thai', 'Vietnamese', 'Malaysian'] },
  { region: 'European', cuisines: ['Italian', 'French', 'Spanish', 'Mediterranean', 'Greek'] },
  { region: 'American', cuisines: ['American', 'Mexican', 'Tex-Mex', 'BBQ'] },
  { region: 'Middle Eastern', cuisines: ['Lebanese', 'Turkish', 'Persian', 'Middle Eastern'] },
  { region: 'Other', cuisines: ['Fusion', 'International', 'Continental'] },
];

function RecommendationDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [restaurantName] = useState(searchParams?.get('name') || '');
  const [restaurantAddress] = useState(searchParams?.get('address') || '');
  
  const [formData, setFormData] = useState({
    types: [] as RecommendationType[],
    cuisines: [] as string[],
    personalNote: '',
    photos: [] as File[],
  });
  
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);

  const toggleType = (type: RecommendationType) => {
    setFormData(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
    
    if (errors.types) {
      setErrors(prev => ({ ...prev, types: '' }));
    }
  };

  const toggleCuisine = (cuisine: string) => {
    setFormData(prev => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter(c => c !== cuisine)
        : [...prev.cuisines, cuisine]
    }));
    
    if (errors.cuisines) {
      setErrors(prev => ({ ...prev, cuisines: '' }));
    }
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, personalNote: e.target.value }));
    if (errors.personalNote) {
      setErrors(prev => ({ ...prev, personalNote: '' }));
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, photos: 'Please select only image files' }));
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, photos: 'Each image must be less than 5MB' }));
        return;
      }
    });
    
    if (formData.photos.length + files.length > 5) {
      setErrors(prev => ({ ...prev, photos: 'Maximum 5 photos allowed' }));
      return;
    }
    
    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
    
    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoUrls(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    
    setErrors(prev => ({ ...prev, photos: '' }));
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
    setPhotoUrls(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.types.length === 0) {
      newErrors.types = 'Please select at least one type';
    }

    if (formData.cuisines.length === 0) {
      newErrors.cuisines = 'Please select at least one cuisine';
    }

    if (!formData.personalNote.trim()) {
      newErrors.personalNote = 'Please add a personal note about this restaurant';
    } else if (formData.personalNote.length > 500) {
      newErrors.personalNote = 'Personal note must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to confirmation page
      router.push('/dashboard/add/confirmation');
    } catch (err) {
      console.log(err);
      setErrors({ general: 'Failed to save recommendation. Please try again.' });
    } finally {
      setIsLoading(false);
    }
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
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">{restaurantName}</h1>
            <p className="text-sm text-gray-600">{restaurantAddress}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Restaurant Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Restaurant Type *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {recommendationTypes.map((type) => {
              const isSelected = formData.types.includes(type.value);
              return (
                <button
                  key={type.value}
                  onClick={() => toggleType(type.value)}
                  className={`flex items-center space-x-3 p-3 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">{type.icon}</span>
                  <span className={`font-medium text-sm ${
                    isSelected ? 'text-orange-900' : 'text-gray-900'
                  }`}>
                    {type.label}
                  </span>
                  {isSelected && (
                    <svg className="w-5 h-5 text-orange-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
          {errors.types && (
            <p className="mt-2 text-sm text-red-600">{errors.types}</p>
          )}
        </div>

        {/* Cuisine */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Cuisine *
          </label>
          <div className="space-y-3">
            {cuisineOptions.map((region) => (
              <div key={region.region} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setExpandedRegion(
                    expandedRegion === region.region ? null : region.region
                  )}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{region.region}</span>
                  <svg 
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${
                      expandedRegion === region.region ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {expandedRegion === region.region && (
                  <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                    {region.cuisines.map((cuisine) => {
                      const isSelected = formData.cuisines.includes(cuisine);
                      return (
                        <button
                          key={cuisine}
                          onClick={() => toggleCuisine(cuisine)}
                          className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                            isSelected
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {cuisine}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
          {errors.cuisines && (
            <p className="mt-2 text-sm text-red-600">{errors.cuisines}</p>
          )}
        </div>

        {/* Personal Note */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Your Personal Note *
          </label>
          <p className="text-sm text-gray-600 mb-3">
            Share what makes this place special to you
          </p>
          <textarea
            value={formData.personalNote}
            onChange={handleNoteChange}
            placeholder="e.g., Best biryani in town! The mutton is perfectly cooked and the flavors are amazing. Must try their raita too."
            rows={4}
            maxLength={500}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none ${
              errors.personalNote ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          />
          <div className="flex justify-between items-center mt-2">
            {errors.personalNote && (
              <p className="text-sm text-red-600">{errors.personalNote}</p>
            )}
            <p className="text-sm text-gray-500 ml-auto">
              {formData.personalNote.length}/500
            </p>
          </div>
        </div>

        {/* Photos */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Photos (Optional)
          </label>
          <p className="text-sm text-gray-600 mb-3">
            Add up to 5 photos of the food or restaurant
          </p>
          
          {/* Photo Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {photoUrls.map((url, index) => (
              <div key={index} className="relative aspect-square">
                <Image
                  src={url}
                  alt={`Photo ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            
            {formData.photos.length < 5 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-orange-500 hover:bg-orange-50 transition-colors"
              >
                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm text-gray-500">Add Photo</span>
              </button>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoSelect}
            className="hidden"
          />
          
          {errors.photos && (
            <p className="text-sm text-red-600">{errors.photos}</p>
          )}
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:transform-none tap-target"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Posting Recommendation...</span>
              </div>
            ) : (
              'Post Recommendation'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RecommendationDetailsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    }>
      <RecommendationDetailsContent />
    </Suspense>
  );
}