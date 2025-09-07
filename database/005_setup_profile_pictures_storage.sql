-- Setup Supabase Storage for Profile Pictures
-- Run this in your Supabase SQL Editor

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true);

-- Storage policies for profile pictures bucket
CREATE POLICY "Users can upload their own profile picture" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile picture" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile picture" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view profile pictures" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile-pictures');

-- Note: Profile pictures will be stored with path structure:
-- profile-pictures/{user_id}/profile.{extension}
-- Example: profile-pictures/123e4567-e89b-12d3-a456-426614174000/profile.jpg