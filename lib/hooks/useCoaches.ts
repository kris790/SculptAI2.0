
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import type { CoachWithListings } from '../types';

export function useCoaches() {
  const [coaches, setCoaches] = useState<CoachWithListings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCoaches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('coaches')
        .select(`
          *,
          coach_listings (*)
        `)
        .eq('is_verified', true);

      if (fetchError) throw fetchError;
      setCoaches(data as unknown as CoachWithListings[] || []);
    } catch (err) {
      console.error('Error fetching coaches:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch coaches'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoaches();
  }, [fetchCoaches]);

  return { coaches, loading, error, refresh: fetchCoaches };
}
