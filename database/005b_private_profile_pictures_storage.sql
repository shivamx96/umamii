-- Setup PRIVATE Supabase Storage for Profile Pictures (Alternative)
-- Run this instead of 005_setup_profile_pictures_storage.sql if you want private bucket

-- Create PRIVATE storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', false);

-- Storage policies for PRIVATE profile pictures bucket
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

-- For private buckets, you need signed URLs to view images
-- This policy allows users to generate signed URLs for any profile picture
CREATE POLICY "Anyone can view profile pictures via signed URL" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile-pictures');

-- Note: With private bucket, you'll need to modify the frontend code
-- to use signed URLs instead of public URLs