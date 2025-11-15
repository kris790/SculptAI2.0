import { supabase } from '../supabaseClient';
import { useAuth } from '../../components/AuthProvider';
import { useAsyncAction } from './useAsyncAction';
import type { Database } from '../database.types';

type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

export function useUserProfiles() {
  const { user, refreshProfile } = useAuth();
  const { execute, loading, error } = useAsyncAction();

  const updateUserProfile = async (updates: UserProfileUpdate) => {
    if (!user) throw new Error('User not authenticated');

    return execute(async () => {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Refresh the profile data in the auth context
      await refreshProfile();
    });
  };

  return { updateUserProfile, loading, error };
}
