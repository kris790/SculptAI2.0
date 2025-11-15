import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabaseClient';
import { useAsyncAction } from '../lib/hooks/useAsyncAction';
import { profileSchema, userProfileSchema, type ProfileFormData, type UserProfileFormData } from '../lib/validations';
import { ErrorMessage } from './ui/ErrorMessage';
import { LoadingSpinner } from './ui/LoadingSpinner';

export default function UserProfile() {
  const { user, profile, userProfile, refreshProfile } = useAuth();
  const { execute, loading, error, clearError } = useAsyncAction();
  
  const [formData, setFormData] = useState<Partial<ProfileFormData>>({});
  const [userProfileData, setUserProfileData] = useState<Partial<UserProfileFormData>>({});
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        age: profile.age || undefined,
        height: profile.height || undefined,
        weight: profile.weight || undefined,
        gender: profile.gender as any,
        fitness_goal: profile.fitness_goal as any,
        unit_preference: profile.unit_preference as any || 'metric',
      });
    }
    if (userProfile) {
        setUserProfileData({
            username: userProfile.username || '',
            bio: userProfile.bio || '',
            location: userProfile.location || '',
            is_visible: userProfile.is_visible,
        });
    }
  }, [profile, userProfile]);

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
    <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-lg shadow-md border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Profile</h2>
        {saveStatus === 'saved' && <span className="text-green-400 text-sm">✓ Saved</span>}
        {saveStatus === 'saving' && <span className="text-indigo-400 text-sm animate-pulse">Saving...</span>}
      </div>

      {error && <ErrorMessage error={error} onDismiss={clearError} />}

      <div className="space-y-6">
        {/* Social Profile Section */}
        <div className="space-y-4 p-4 border border-gray-600 rounded-lg">
            <h3 className="text-lg font-semibold text-indigo-400">Public Profile</h3>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                <input type="text" value={userProfileData.username || ''} onChange={(e) => setUserProfileData(p => ({...p, username: e.target.value}))} className="w-full input-style" />
                {validationErrors.username && <p className="mt-1 text-sm text-red-400">{validationErrors.username}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Bio</label>
                <textarea value={userProfileData.bio || ''} onChange={(e) => setUserProfileData(p => ({...p, bio: e.target.value}))} rows={2} className="w-full input-style" />
            </div>
             <div className="flex items-center">
                <input type="checkbox" id="is_visible" checked={userProfileData.is_visible} onChange={(e) => setUserProfileData(p => ({...p, is_visible: e.target.checked}))} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500" />
                <label htmlFor="is_visible" className="ml-2 block text-sm text-gray-300">Make profile public</label>
            </div>
        </div>

        {/* Private Profile Section */}
        <div className="space-y-4 p-4 border border-gray-600 rounded-lg">
            <h3 className="text-lg font-semibold text-indigo-400">Private Details</h3>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                <input type="text" value={formData.full_name || ''} onChange={(e) => setFormData(p => ({...p, full_name: e.target.value}))} className="w-full input-style" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="number" placeholder="Age" value={formData.age || ''} onChange={(e) => setFormData(p => ({...p, age: e.target.value ? parseInt(e.target.value) : undefined}))} className="w-full input-style" />
                <select value={formData.gender || ''} onChange={(e) => setFormData(p => ({...p, gender: e.target.value as any}))} className="w-full input-style">
                    <option value="">Gender...</option>
                    <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option><option value="prefer_not_to_say">Prefer not to say</option>
                </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="number" placeholder="Height (cm)" step="0.1" value={formData.height || ''} onChange={(e) => setFormData(p => ({...p, height: e.target.value ? parseFloat(e.target.value) : undefined}))} className="w-full input-style" />
                <input type="number" placeholder="Weight (kg)" step="0.1" value={formData.weight || ''} onChange={(e) => setFormData(p => ({...p, weight: e.target.value ? parseFloat(e.target.value) : undefined}))} className="w-full input-style" />
            </div>
            <select value={formData.fitness_goal || ''} onChange={(e) => setFormData(p => ({...p, fitness_goal: e.target.value as any}))} className="w-full input-style">
                <option value="">Fitness Goal...</option>
                <option value="lose_weight">Lose Weight</option><option value="build_muscle">Build Muscle</option><option value="maintain">Maintain</option><option value="improve_fitness">Improve Fitness</option>
            </select>
        </div>

        <button onClick={handleUpdateProfile} disabled={loading} className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}

// Add a simple CSS-in-JS for the input style to avoid repetition
const styles = `
.input-style {
    background-color: #374151; /* gray-700 */
    border: 1px solid #4B5563; /* gray-600 */
    border-radius: 0.375rem;
    width: 100%;
    padding: 0.5rem 0.75rem;
}
.input-style:focus {
    outline: none;
    --tw-ring-color: #6366F1; /* indigo-500 */
    box-shadow: 0 0 0 2px var(--tw-ring-color);
}
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
