
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabaseClient';
import { useAsyncAction } from '../lib/hooks/useAsyncAction';
import { profileSchema, userProfileSchema, type ProfileFormData, type UserProfileFormData } from '../lib/validations';
import { ErrorMessage } from './ui/ErrorMessage';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { useDummyData } from '../context/DummyDataContext';

export default function UserProfile() {
  const { user, profile, userProfile, refreshProfile } = useAuth();
  const { currentUser } = useDummyData();
  const { execute, loading, error, clearError } = useAsyncAction();
  
  const [formData, setFormData] = useState<Partial<ProfileFormData>>({
    full_name: currentUser.name,
    age: 28,
    height: 182,
    weight: 84,
    gender: 'male',
    fitness_goal: currentUser.goal,
    unit_preference: 'metric'
  });
  
  const [userProfileData, setUserProfileData] = useState<Partial<UserProfileFormData>>({
    username: currentUser.email.split('@')[0],
    bio: 'Dedicated physique architect focusing on structural symmetry.',
    location: 'Venice Beach',
    is_visible: true
  });
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || currentUser.name,
        age: profile.age || 28,
        height: profile.height || 182,
        weight: profile.weight || 84,
        gender: (profile.gender as any) || 'male',
        fitness_goal: (profile.fitness_goal as any) || currentUser.goal,
        unit_preference: (profile.unit_preference as any) || 'metric',
      });
    }
    if (userProfile) {
        setUserProfileData({
            username: userProfile.username || currentUser.email.split('@')[0],
            bio: userProfile.bio || 'Dedicated physique architect focusing on structural symmetry.',
            location: userProfile.location || 'Venice Beach',
            is_visible: userProfile.is_visible ?? true,
        });
    }
  }, [profile, userProfile, currentUser]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    // Validate both forms
    const profileResult = profileSchema.safeParse(formData);
    const userProfileResult = userProfileSchema.safeParse(userProfileData);

    const allErrors: Record<string, string> = {};
    if (!profileResult.success) {
      profileResult.error.issues.forEach(err => {
        if (err.path[0]) allErrors[err.path[0].toString()] = err.message;
      });
    }
    if (!userProfileResult.success) {
      userProfileResult.error.issues.forEach(err => {
        if (err.path[0]) allErrors[err.path[0].toString()] = err.message;
      });
    }

    if (Object.keys(allErrors).length > 0) {
      setValidationErrors(allErrors);
      setSaveStatus('error');
      return;
    }

    setValidationErrors({});
    setSaveStatus('saving');
    clearError();

    const success = await execute(async () => {
      // Upsert core profile
      const { error: profileError } = await supabase.from('profiles').upsert({ id: user.id, ...profileResult.data! });
      if (profileError) throw profileError;
      
      // Upsert user (social) profile
      const { error: userProfileError } = await supabase.from('user_profiles').upsert({ id: user.id, ...userProfileResult.data! });
      if (userProfileError) throw userProfileError;

      await refreshProfile();
    });

    setSaveStatus(success ? 'saved' : 'error');
    if (success) setTimeout(() => setSaveStatus('idle'), 2000);
  };

  if (loading && !profile) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-900 rounded-[2rem] shadow-md border border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Your Profile</h2>
        {saveStatus === 'saved' && <span className="text-green-400 text-sm font-bold uppercase tracking-widest">✓ Synchronized</span>}
        {saveStatus === 'saving' && <span className="text-indigo-400 text-sm animate-pulse font-bold uppercase tracking-widest">Saving...</span>}
      </div>

      {error && <ErrorMessage error={error} onDismiss={clearError} />}

      <div className="space-y-6">
        {/* Social Profile Section */}
        <div className="space-y-4 p-6 border border-white/5 bg-white/[0.02] rounded-3xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Public Protocol</h3>
            <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Username</label>
                <input type="text" value={userProfileData.username || ''} onChange={(e) => setUserProfileData(p => ({...p, username: e.target.value}))} className="w-full input-style text-white" />
                {validationErrors.username && <p className="mt-1 text-sm text-red-400">{validationErrors.username}</p>}
            </div>
            <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Profile Visibility</label>
                <div className="flex items-center mt-2">
                    <input type="checkbox" id="is_visible" checked={userProfileData.is_visible} onChange={(e) => setUserProfileData(p => ({...p, is_visible: e.target.checked}))} className="h-5 w-5 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500 transition-all" />
                    <label htmlFor="is_visible" className="ml-3 block text-sm font-medium text-slate-300">Public profile on network</label>
                </div>
            </div>
        </div>

        {/* Private Profile Section */}
        <div className="space-y-4 p-6 border border-white/5 bg-white/[0.02] rounded-3xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Biological Baseline</h3>
            <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Full Name</label>
                <input type="text" value={formData.full_name || ''} onChange={(e) => setFormData(p => ({...p, full_name: e.target.value}))} className="w-full input-style text-white" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Age</label>
                  <input type="number" placeholder="Age" value={formData.age || ''} onChange={(e) => setFormData(p => ({...p, age: e.target.value ? parseInt(e.target.value) : undefined}))} className="w-full input-style text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Gender</label>
                  <select value={formData.gender || ''} onChange={(e) => setFormData(p => ({...p, gender: e.target.value as any}))} className="w-full input-style text-white">
                      <option value="">Gender...</option>
                      <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option><option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Height (cm)</label>
                  <input type="number" placeholder="Height (cm)" step="0.1" value={formData.height || ''} onChange={(e) => setFormData(p => ({...p, height: e.target.value ? parseFloat(e.target.value) : undefined}))} className="w-full input-style text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Weight (kg)</label>
                  <input type="number" placeholder="Weight (kg)" step="0.1" value={formData.weight || ''} onChange={(e) => setFormData(p => ({...p, weight: e.target.value ? parseFloat(e.target.value) : undefined}))} className="w-full input-style text-white" />
                </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Primary Objective</label>
              <select value={formData.fitness_goal || ''} onChange={(e) => setFormData(p => ({...p, fitness_goal: e.target.value as any}))} className="w-full input-style text-white">
                  <option value="">Select your trajectory...</option>
                  <option value="lose_weight">Lose Weight / Fat Loss</option>
                  <option value="build_muscle">Build Muscle / Hypertrophy</option>
                  <option value="body_recomp">Body Recomposition</option>
                  <option value="competition_prep">Competition Prep</option>
                  <option value="maintain">Maintain Physique</option>
                  <option value="improve_fitness">General Fitness</option>
              </select>
            </div>
        </div>

        <button onClick={handleUpdateProfile} disabled={loading} className="w-full bg-indigo-600 text-white py-5 px-4 rounded-2xl hover:bg-indigo-500 disabled:opacity-50 transition-all font-black uppercase italic tracking-[0.2em] shadow-xl shadow-indigo-600/20 active:scale-[0.98]">
          {loading ? 'Processing...' : 'Synchronize Profile'}
        </button>
      </div>
    </div>
  );
}

// Add a simple CSS-in-JS for the input style to avoid repetition
const styles = `
.input-style {
    background-color: #0f172a; 
    border: 1px solid #1e293b;
    border-radius: 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    font-weight: 600;
}
.input-style:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 1px #6366f1;
}
`;
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
