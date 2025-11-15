import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import type { Database } from '../lib/database.types'

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

interface AuthContextValue {
  user: User | null
  profile: Profile | null;
  userProfile: UserProfile | null;
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true)

  const fetchAllProfiles = useCallback(async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (profileError) throw profileError;
      setProfile(profileData);

      const { data: userProfileData, error: userProfileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (userProfileError) throw userProfileError;
      setUserProfile(userProfileData);

    } catch (error) {
      console.error('Error fetching profiles:', error);
      setProfile(null);
      setUserProfile(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setUser(session?.user || null);
          if (session?.user) {
            await fetchAllProfiles(session.user.id);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        setUser(session?.user || null);
        
        if (session?.user) {
          await fetchAllProfiles(session.user.id);
        } else {
          setProfile(null);
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchAllProfiles]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}` }
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}`
    });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchAllProfiles(user.id);
  }, [user, fetchAllProfiles]);

  const value = useMemo(
    () => ({
      user,
      profile,
      userProfile,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      refreshProfile,
    }),
    [user, profile, userProfile, loading, signIn, signUp, signOut, resetPassword, updatePassword, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
