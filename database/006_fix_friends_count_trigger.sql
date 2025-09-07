-- Fix the friends count trigger to run with elevated privileges
-- This allows it to bypass RLS and update both users' friend counts properly

CREATE OR REPLACE FUNCTION update_friends_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
    UPDATE profiles SET friends_count = friends_count + 1 WHERE id = NEW.user_id;
    UPDATE profiles SET friends_count = friends_count + 1 WHERE id = NEW.friend_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'accepted' THEN
    UPDATE profiles SET friends_count = GREATEST(friends_count - 1, 0) WHERE id = OLD.user_id;
    UPDATE profiles SET friends_count = GREATEST(friends_count - 1, 0) WHERE id = OLD.friend_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
    UPDATE profiles SET friends_count = friends_count + 1 WHERE id = NEW.user_id;
    UPDATE profiles SET friends_count = friends_count + 1 WHERE id = NEW.friend_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'accepted' AND NEW.status != 'accepted' THEN
    UPDATE profiles SET friends_count = GREATEST(friends_count - 1, 0) WHERE id = OLD.user_id;
    UPDATE profiles SET friends_count = GREATEST(friends_count - 1, 0) WHERE id = OLD.friend_id;
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The SECURITY DEFINER clause allows the function to run with admin privileges
-- rather than the calling user's privileges, bypassing RLS policies