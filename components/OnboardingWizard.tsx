
import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabaseClient';
import { useAsyncAction } from '../lib/hooks/useAsyncAction';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { SparklesIcon } from './icons';
import { generateTrainingProgram } from '../lib/ai/program-generator';
import { GoalCard } from './onboarding/GoalCard';
import { measurementSchema, type MeasurementFormData } from '../lib/validations';

interface OnboardingWizardProps {
  onComplete: () => void;
}

const goals = [
  {
    id: 'lose_weight',
    title: 'Lose Weight',
    description: 'Focus on fat loss while maintaining muscle and skeletal structure.',
    icon: '⚖️',
    targetRatio: 1.4,
    timeline: [12, 16, 20],
  },
  {
    id: 'build_muscle',
    title: 'Gain Muscle',
    description: 'Build lean mass with hypertrophy focus to widen the skeletal frame.',
    icon: '💪',
    targetRatio: 1.5,
    timeline: [16, 20, 24],
  },
  {
    id: 'body_recomp',
    title: 'Body Recomposition',
    description: 'Lose fat and gain muscle simultaneously for elite symmetry refinement.',
    icon: '🔄',
    targetRatio: 1.45,
    timeline: [16, 20, 24],
  },
  {
    id: 'competition_prep',
    title: 'Competition Prep',
    description: '27-week stage-ready physique development and extreme conditioning.',
    icon: '🏆',
    targetRatio: 1.5,
    timeline: [27],
  },
];

const trainingExperiences = [
  { id: 'beginner', label: 'Beginner (0-6 months)' },
  { id: 'intermediate', label: 'Intermediate (6-24 months)' },
  { id: 'advanced', label: 'Advanced (2-5 years)' },
  { id: 'elite', label: 'Elite (5+ years)' },
];

const activityLevels = [
  { id: 'sedentary', label: 'Sedentary (Office job)' },
  { id: 'light', label: 'Light (1-2 workouts/week)' },
  { id: 'moderate', label: 'Moderate (3-4 workouts/week)' },
  { id: 'active', label: 'Active (5-6 workouts/week)' },
  { id: 'very-active', label: 'Very Active (2x/day training)' },
];

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { user, refreshProfile } = useAuth();
  const { execute, loading } = useAsyncAction();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // State
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [selectedTimeline, setSelectedTimeline] = useState<number>(0);
  
  const [bioData, setBioData] = useState({
    fullName: '',
    age: '',
    height: '',
    gender: 'male' as 'male' | 'female' | 'other',
  });

  const [measurements, setMeasurements] = useState({
    shoulders: '',
    waist: '',
    weight: '',
    chest: '',
    arms: '',
    bodyFat: '',
  });

  const [background, setBackground] = useState({
    experience: 'beginner' as any,
    activity: 'moderate' as any,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeGoal = goals.find(g => g.id === selectedGoalId);

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 0) {
      if (!selectedGoalId) newErrors.goal = 'Selection required';
      if (!selectedTimeline) newErrors.timeline = 'Timeline required';
    } else if (currentStep === 1) {
      if (!bioData.fullName) newErrors.fullName = 'Required';
      if (!bioData.age) newErrors.age = 'Required';
      if (!bioData.height) newErrors.height = 'Required';
      if (!measurements.weight) newErrors.weight = 'Required';
    } else if (currentStep === 2) {
      if (!measurements.shoulders) newErrors.shoulders = 'Required';
      if (!measurements.waist) newErrors.waist = 'Required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setCurrentStep(prev => prev + 1);
  };

  const handleFinalize = async () => {
    if (!user) return;
    setIsGenerating(true);
    
    const success = await execute(async () => {
      const currentRatio = (parseFloat(measurements.shoulders) / parseFloat(measurements.waist)).toFixed(2);

      const aiData = {
        goal: selectedGoalId,
        currentRatio,
        targetRatio: activeGoal?.targetRatio || 1.5,
        timelineWeeks: selectedTimeline,
        bio: {
          gender: bioData.gender,
          age: bioData.age,
          height: bioData.height,
          weight: measurements.weight,
          experience: background.experience,
        }
      };

      const blueprint = await generateTrainingProgram(aiData as any);

      // 1. Update Profile (Base)
      const { error: pErr } = await supabase.from('profiles').update({
        full_name: bioData.fullName,
        fitness_goal: selectedGoalId,
        age: parseInt(bioData.age),
        height: parseFloat(bioData.height),
        weight: parseFloat(measurements.weight),
        gender: bioData.gender,
      }).eq('id', user.id);
      if (pErr) throw pErr;

      // 2. Update Social Profile (Bio/Experience)
      const { error: upErr } = await supabase.from('user_profiles').update({
        experience_level: background.experience.charAt(0).toUpperCase() + background.experience.slice(1),
        bio: blueprint
      }).eq('id', user.id);
      if (upErr) throw upErr;

      // 3. Log initial scan
      const { error: lErr } = await supabase.from('progress_logs').insert({
        user_id: user.id,
        log_date: new Date().toISOString().split('T')[0],
        weight: parseFloat(measurements.weight),
        shoulders: parseFloat(measurements.shoulders),
        waist: parseFloat(measurements.waist),
        chest: measurements.chest ? parseFloat(measurements.chest) : null,
        arms: measurements.arms ? parseFloat(measurements.arms) : null,
        body_fat_percentage: measurements.bodyFat ? parseFloat(measurements.bodyFat) : null,
        notes: `Initial Onboarding Scan. Experience: ${background.experience}. Goal: ${selectedGoalId}.`
      });
      if (lErr) throw lErr;

      await refreshProfile();
      onComplete();
    });
    
    if (!success) setIsGenerating(false);
  };

  const progressSteps = ['Objectives', 'Basics', 'Metrics', 'Synthesis'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f172a] p-4 sm:p-6 overflow-y-auto">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent)] pointer-events-none" />
      
      <div className="max-w-4xl w-full bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative">
        {/* Progress Nav */}
        <div className="flex justify-between items-center mb-12">
          {progressSteps.map((title, idx) => (
            <div key={title} className="flex-1 flex flex-col items-center">
              <div className={`h-1 w-full rounded-full transition-all duration-700 mb-4 ${idx <= currentStep ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-white/5'}`} />
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${idx <= currentStep ? 'text-indigo-400' : 'text-slate-600'}`}>
                {title}
              </p>
            </div>
          ))}
        </div>

        {/* Step 0: Trajectory */}
        {currentStep === 0 && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2 underline decoration-indigo-500 decoration-4 underline-offset-8">Aesthetic Trajectory</h2>
              <p className="text-slate-400 font-medium">Define your primary objective and timeline.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  {...goal}
                  isSelected={selectedGoalId === goal.id}
                  onSelect={() => {
                    setSelectedGoalId(goal.id);
                    setSelectedTimeline(goal.timeline[0]);
                  }}
                />
              ))}
            </div>

            {selectedGoalId && (
              <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 animate-fade-in">
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Phase Duration (Weeks)</h3>
                <div className="flex flex-wrap gap-2">
                  {activeGoal?.timeline.map((weeks) => (
                    <button
                      key={weeks}
                      onClick={() => setSelectedTimeline(weeks)}
                      className={`flex-1 py-4 rounded-xl font-black text-xs uppercase italic transition-all ${
                        selectedTimeline === weeks
                          ? 'bg-indigo-600 text-white shadow-xl'
                          : 'bg-slate-800 text-slate-500 hover:text-white'
                      }`}
                    >
                      {weeks} Weeks
                    </button>
                  ))}
                </div>
              </div>
            )}
            {errors.goal && <p className="text-center text-red-400 text-[10px] font-black uppercase tracking-widest">{errors.goal}</p>}
          </div>
        )}

        {/* Step 1: Biological Basics */}
        {currentStep === 1 && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">Biological Basics</h2>
              <p className="text-slate-400 font-medium">Your physiological foundation for AI calibration.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity & Age</label>
                <input
                  placeholder="Full Name"
                  value={bioData.fullName}
                  onChange={(e) => setBioData({...bioData, fullName: e.target.value})}
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold italic focus:ring-1 focus:ring-indigo-500 outline-none"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number" placeholder="Age"
                    value={bioData.age}
                    onChange={(e) => setBioData({...bioData, age: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold italic focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                  <select
                    value={bioData.gender}
                    onChange={(e) => setBioData({...bioData, gender: e.target.value as any})}
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold italic outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Frame Dimensions</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number" placeholder="Height (in)"
                    value={bioData.height}
                    onChange={(e) => setBioData({...bioData, height: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold italic focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                  <input
                    type="number" placeholder="Weight (lbs)"
                    value={measurements.weight}
                    onChange={(e) => setMeasurements({...measurements, weight: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold italic focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                   <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Training Level</p>
                   <select
                    value={background.experience}
                    onChange={(e) => setBackground({...background, experience: e.target.value as any})}
                    className="w-full bg-transparent text-white font-bold italic outline-none"
                  >
                    {trainingExperiences.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Structural Analysis */}
        {currentStep === 2 && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">Structural Analysis</h2>
              <p className="text-slate-400 font-medium">Precision measurements for V-Taper tracking (Inches).</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { id: 'shoulders', label: 'Shoulders*', required: true },
                { id: 'waist', label: 'Waist*', required: true },
                { id: 'chest', label: 'Chest' },
                { id: 'arms', label: 'Arms' },
                { id: 'bodyFat', label: 'Body Fat %' }
              ].map(f => (
                <div key={f.id}>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block ml-1">{f.label}</label>
                  <input
                    type="number" step="0.1" placeholder="0.0"
                    value={(measurements as any)[f.id]}
                    onChange={(e) => setMeasurements({...measurements, [f.id]: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-black italic focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              ))}
              <div className="flex flex-col justify-end">
                <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-xl p-3 text-center">
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Current Ratio</p>
                  <p className="text-2xl font-black text-white italic">
                    {measurements.shoulders && measurements.waist ? (parseFloat(measurements.shoulders)/parseFloat(measurements.waist)).toFixed(2) : '--'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Activity Level</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activityLevels.map(lvl => (
                  <button
                    key={lvl.id}
                    onClick={() => setBackground({...background, activity: lvl.id})}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase italic transition-all border ${
                      background.activity === lvl.id ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-white/5 text-slate-500'
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Synthesis */}
        {currentStep === 3 && (
          <div className="animate-fade-in space-y-10 text-center py-6">
            <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-indigo-600/50">
              <SparklesIcon className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">Architecture Ready</h2>
              <p className="text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
                Protocol synthesized for a <span className="text-indigo-400 font-bold">{selectedTimeline}-week</span> journey targeting a <span className="text-indigo-400 font-bold">{activeGoal?.targetRatio}:1</span> symmetry index.
              </p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-left max-w-sm mx-auto space-y-3">
               <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Blueprint Initialization</p>
               <div className="flex justify-between text-xs text-white"><span>Objective</span><span className="font-black uppercase">{selectedGoalId.replace('_', ' ')}</span></div>
               <div className="flex justify-between text-xs text-white"><span>Initial Ratio</span><span className="font-black italic">{(parseFloat(measurements.shoulders)/parseFloat(measurements.waist)).toFixed(2)}</span></div>
               <div className="flex justify-between text-xs text-white"><span>User Basis</span><span className="font-black uppercase">{background.experience}</span></div>
            </div>
          </div>
        )}

        <div className="mt-12 flex gap-4">
          {currentStep > 0 && !isGenerating && (
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-8 py-5 border border-white/10 text-slate-500 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:text-white hover:bg-white/5 transition-all"
            >
              Back
            </button>
          )}
          <button
            onClick={currentStep === 3 ? handleFinalize : handleNext}
            disabled={loading || isGenerating}
            className="flex-1 bg-white text-black font-black uppercase italic tracking-widest h-16 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center gap-3">
                <LoadingSpinner size="sm" />
                <span className="animate-pulse">Generating Blueprint...</span>
              </div>
            ) : currentStep === 3 ? 'Deploy Architecture' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
