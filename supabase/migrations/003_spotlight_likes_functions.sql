
-- RPC functions for managing spotlight like counts atomically
CREATE OR REPLACE FUNCTION increment_spotlight_likes(spotlight_id_in UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.athlete_spotlights
  SET likes_count = likes_count + 1
  WHERE id = spotlight_id_in;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_spotlight_likes(spotlight_id_in UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.athlete_spotlights
  SET likes_count = GREATEST(0, likes_count - 1)
  WHERE id = spotlight_id_in;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
