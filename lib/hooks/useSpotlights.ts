import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../../components/AuthProvider';
import type { Database } from '../database.types';

type Spotlight = Database['public']['Tables']['athlete_spotlights']['Row'] & {
  user_profiles: { username: string | null } | null;
  is_liked_by_user: boolean;
};

export function useSpotlights() {
  const { user } = useAuth();
  const [spotlights, setSpotlights] = useState<Spotlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSpotlights = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('athlete_spotlights')
        .select(`
          *,
          user_profiles ( username ),
          spotlight_likes ( user_id )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedData = data.map(s => ({
        ...s,
        // Fix: Add Array.isArray check to prevent calling .some on a non-array if the join fails.
        is_liked_by_user: Array.isArray(s.spotlight_likes) && s.spotlight_likes.some(like => like.user_id === user.id)
      }));

      setSpotlights(processedData as unknown as Spotlight[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch spotlights'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
        fetchSpotlights();
    }
  }, [user, fetchSpotlights]);
  
  const createSpotlight = async (title: string, content: string) => {
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('athlete_spotlights')
      .insert({ user_id: user.id, title, content });

    if (error) {
      setError(error);
    } else {
      await fetchSpotlights();
    }
  };

  const toggleLike = async (spotlightId: string, isCurrentlyLiked: boolean) => {
     if (!user) throw new Error('Not authenticated');

     if (isCurrentlyLiked) {
         // Unlike
         await supabase.from('spotlight_likes').delete().match({ user_id: user.id, spotlight_id: spotlightId });
         // Fix: Cast RPC call to 'any' to bypass incomplete DB types.
         await (supabase.rpc as any)('decrement_spotlight_likes', { spotlight_id_in: spotlightId });
     } else {
         // Like
         await supabase.from('spotlight_likes').insert({ user_id: user.id, spotlight_id: spotlightId });
         // Fix: Cast RPC call to 'any' to bypass incomplete DB types.
         await (supabase.rpc as any)('increment_spotlight_likes', { spotlight_id_in: spotlightId });
     }
     await fetchSpotlights(); // Refresh data
  };


  return { spotlights, loading, error, createSpotlight, toggleLike, fetchSpotlights };
}
