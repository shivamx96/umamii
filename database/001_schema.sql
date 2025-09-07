-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  bio TEXT,
  profile_picture_url TEXT,
  preferences JSONB DEFAULT '[]'::JSONB,
  friends_count INTEGER DEFAULT 0,
  recommendations_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restaurants table with PostGIS for location
CREATE TABLE restaurants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  cuisine TEXT[] DEFAULT '{}',
  rating NUMERIC(2,1),
  price_level INTEGER CHECK (price_level >= 1 AND price_level <= 4),
  google_place_id TEXT,
  zomato_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create spatial index for location queries
CREATE INDEX idx_restaurants_location ON restaurants USING GIST (location);

-- Recommendations table
CREATE TABLE recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT[] DEFAULT '{}',
  cuisine TEXT[] DEFAULT '{}',
  personal_note TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  upvotes INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Friends/relationships table
CREATE TABLE friends (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Recommendation upvotes (for tracking who upvoted what)
CREATE TABLE recommendation_upvotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recommendation_id UUID REFERENCES recommendations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(recommendation_id, user_id)
);

-- Notifications table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('friend_request', 'map_suggestion', 'upvote', 'comment')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to find nearby restaurants
CREATE OR REPLACE FUNCTION nearby_restaurants(lat DOUBLE PRECISION, lng DOUBLE PRECISION, radius_km DOUBLE PRECISION DEFAULT 5.0)
RETURNS TABLE (
  id UUID,
  name TEXT,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  distance_km DOUBLE PRECISION
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.address,
    ST_Y(r.location::geometry) as latitude,
    ST_X(r.location::geometry) as longitude,
    ST_Distance(r.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) / 1000 as distance_km
  FROM restaurants r
  WHERE ST_DWithin(r.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, radius_km * 1000)
  ORDER BY r.location <-> ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography;
END;
$$;

-- Function to update recommendation upvotes count
CREATE OR REPLACE FUNCTION update_recommendation_upvotes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE recommendations 
    SET upvotes = upvotes + 1 
    WHERE id = NEW.recommendation_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE recommendations 
    SET upvotes = upvotes - 1 
    WHERE id = OLD.recommendation_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update user recommendations count
CREATE OR REPLACE FUNCTION update_user_recommendations_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles 
    SET recommendations_count = recommendations_count + 1 
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles 
    SET recommendations_count = recommendations_count - 1 
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update user friends count
CREATE OR REPLACE FUNCTION update_friends_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
    UPDATE profiles SET friends_count = friends_count + 1 WHERE id = NEW.user_id;
    UPDATE profiles SET friends_count = friends_count + 1 WHERE id = NEW.friend_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'accepted' THEN
    UPDATE profiles SET friends_count = friends_count - 1 WHERE id = OLD.user_id;
    UPDATE profiles SET friends_count = friends_count - 1 WHERE id = OLD.friend_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
    UPDATE profiles SET friends_count = friends_count + 1 WHERE id = NEW.user_id;
    UPDATE profiles SET friends_count = friends_count + 1 WHERE id = NEW.friend_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'accepted' AND NEW.status != 'accepted' THEN
    UPDATE profiles SET friends_count = friends_count - 1 WHERE id = NEW.user_id;
    UPDATE profiles SET friends_count = friends_count - 1 WHERE id = NEW.friend_id;
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_recommendation_upvotes_count
  AFTER INSERT OR DELETE ON recommendation_upvotes
  FOR EACH ROW EXECUTE FUNCTION update_recommendation_upvotes_count();

CREATE TRIGGER trigger_update_user_recommendations_count
  AFTER INSERT OR DELETE ON recommendations
  FOR EACH ROW EXECUTE FUNCTION update_user_recommendations_count();

CREATE TRIGGER trigger_update_friends_count
  AFTER INSERT OR UPDATE OR DELETE ON friends
  FOR EACH ROW EXECUTE FUNCTION update_friends_count();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, phone_number, name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.phone, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Restaurants policies (public read access)
CREATE POLICY "Anyone can view restaurants" ON restaurants FOR SELECT USING (true);

-- Recommendations policies
CREATE POLICY "Anyone can view approved recommendations" ON recommendations 
FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can insert their own recommendations" ON recommendations 
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recommendations" ON recommendations 
FOR UPDATE USING (auth.uid() = user_id);

-- Friends policies
CREATE POLICY "Users can view their own friend relationships" ON friends 
FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can create friend requests" ON friends 
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update friend requests they're involved in" ON friends 
FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Upvotes policies
CREATE POLICY "Users can view all upvotes" ON recommendation_upvotes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own upvotes" ON recommendation_upvotes 
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own upvotes" ON recommendation_upvotes 
FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications 
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON notifications 
FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX idx_recommendations_restaurant_id ON recommendations(restaurant_id);
CREATE INDEX idx_recommendations_created_at ON recommendations(created_at DESC);
CREATE INDEX idx_friends_user_id ON friends(user_id);
CREATE INDEX idx_friends_status ON friends(status);
CREATE INDEX idx_notifications_user_id_read ON notifications(user_id, is_read);
CREATE INDEX idx_recommendation_upvotes_user_id ON recommendation_upvotes(user_id);

-- Insert some sample data (optional)
INSERT INTO restaurants (name, address, location, cuisine, rating) VALUES
  ('Paradise Biryani', 'Secunderabad, Hyderabad', ST_SetSRID(ST_MakePoint(78.4983, 17.4399), 4326), ARRAY['Indian', 'Biryani'], 4.6),
  ('Seoul Kitchen', 'Indiranagar, Bangalore', ST_SetSRID(ST_MakePoint(77.6412, 12.9719), 4326), ARRAY['Korean'], 4.3),
  ('Ramesh Tiffin Center', 'Koti, Hyderabad', ST_SetSRID(ST_MakePoint(78.4747, 17.3616), 4326), ARRAY['South Indian'], 4.2);