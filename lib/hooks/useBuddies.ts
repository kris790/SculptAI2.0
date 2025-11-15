import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../../components/AuthProvider';
import type { Database } from '../database.types';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
// Fix: Update Connection type to use simplified 'requester' and 'addressee' properties.
type Connection = Database['public']['Tables']['buddy_connections']['Row'] & {
  requester: UserProfile | null;
  addressee: UserProfile | null;
};

export function useBuddies() {
  const { user } = useAuth();
  const [potentialBuddies, setPotentialBuddies] = useState<UserProfile[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const searchUsers = useCallback(async (filters: { location: string; fitness_goal: string; }) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('user_profiles')
        .select('*')
        .neq('id', user.id)
        .eq('is_visible', true)
        .limit(20);

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters.fitness_goal) {
         query = query.contains('fitness_goals', [filters.fitness_goal]);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPotentialBuddies(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to search users'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  const sendBuddyRequest = async (addresseeId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('buddy_connections')
      .insert({ requester_id: user.id, addressee_id: addresseeId });

    if (error) {
      setError(error);
      alert(`Error sending request: ${error.message}`);
    } else {
      setPotentialBuddies(prev => prev.filter(p => p.id !== addresseeId));
      alert('Buddy request sent!');
    }
  };
  
  const fetchConnections = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
        const { data, error } = await supabase
            .from('buddy_connections')
            // Fix: Use standard Supabase syntax for joining on ambiguous foreign keys.
            .select(`
                *,
                requester:user_profiles!requester_id(*),
                addressee:user_profiles!addressee_id(*)
            `)
            .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
            .neq('status', 'removed'); // Don't show removed connections

        if (error) throw error;
        // Fix: Cast to 'unknown' first to handle Supabase's complex return type.
        setConnections(data as unknown as Connection[]);
    } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch connections'));
    } finally {
        setLoading(false);
    }
  }, [user]);

  const updateConnectionStatus = async (connectionId: string, status: 'accepted' | 'declined' | 'removed') => {
      const { error } = await supabase
          .from('buddy_connections')
          .update({ status })
          .eq('id', connectionId);
      
      if (error) {
          setError(error);
      } else {
          fetchConnections();
      }
  };

  useEffect(() => {
    if (user) {
        searchUsers({ location: '', fitness_goal: '' });
    }
  }, [user, searchUsers]);

  return { potentialBuddies, connections, loading, error, searchUsers, sendBuddyRequest, fetchConnections, updateConnectionStatus };
}