import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../../components/AuthProvider';
import type { Database } from '../database.types';

type Challenge = Database['public']['Tables']['community_challenges']['Row'] & {
  user_challenge_participation: { current_progress: number, completed: boolean }[] | null;
};

export function useChallenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchChallenges = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('community_challenges')
        .select(`
          *,
          user_challenge_participation!left(current_progress, completed)
        `)
        .lte('start_date', now)
        .gte('end_date', now)
        .eq('user_challenge_participation.user_id', user.id)
        .order('end_date', { ascending: true });

      if (error) throw error;
      // Fix: Cast to 'unknown' first to handle complex/failing join type from Supabase.
      setChallenges(data as unknown as Challenge[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch challenges'));
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
      if (user) {
          fetchChallenges();
      }
  }, [user, fetchChallenges]);

  const joinChallenge = async (challengeId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('user_challenge_participation')
      .insert({ user_id: user.id, challenge_id: challengeId });
    
    if (error) {
      setError(error);
      alert(`Error joining challenge: ${error.message}`);
    } else {
      await fetchChallenges();
    }
  };

  return { challenges, loading, error, fetchChallenges, joinChallenge };
}