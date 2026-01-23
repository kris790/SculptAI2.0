
import React, { useState, useMemo } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabaseClient';
import { useAsyncAction } from '../lib/hooks/useAsyncAction';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { SparklesIcon } from './icons';
import { generateTrainingProgram } from '../lib/ai/program-generator';
import { GoalCard } from './onboarding/GoalCard';
import { measurementSchema } from '../lib/validations';

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

  const [photos, setPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeGoal = goals.find(g => g.id === selectedGoalId);

  const currentRatio = useMemo(() => {
    const s = parseFloat(measurements.shoulders);
    const w = parseFloat(measurements.waist);
    if (s > 0 && w > 0) return (s / w).toFixed(2);
    return '0.00';
  }, [measurements.shoulders, measurements.waist]);

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

  const progressSteps = ['Objectives', 'Metrics', 'Synthesis'];

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

        {/* Step 1: Body Metrics */}
        {currentStep === 1 && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">Architectural Scan</h2>
              <p className="text-slate-400 font-medium leading-relaxed max-w-xl mx-auto">Precision metrics are mandatory for calibrated coaching.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
                  <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 italic">Biological Baseline</h3>
                  <div className="space-y-4">
                    <input
                      placeholder="FULL NAME"
                      value={bioData.fullName}
                      onChange={(e) => setBioData({...bioData, fullName: e.target.value})}
                      className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white font-black italic tracking-tight focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number" placeholder="AGE"
                        value={bioData.age}
                        onChange={(e) => setBioData({...bioData, age: e.target.value})}
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white font-black italic tracking-tight focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                      <select
                        value={bioData.gender}
                        onChange={(e) => setBioData({...bioData, gender: e.target.value as any})}
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white font-black italic tracking-tight outline-none"
                      >
                        <option value="male">MALE</option>
                        <option value="female">FEMALE</option>
                        <option value="other">OTHER</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number" placeholder="HEIGHT (IN)"
                        value={bioData.height}
                        onChange={(e) => setBioData({...bioData, height: e.target.value})}
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white font-black italic tracking-tight focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                      <input
                        type="number" placeholder="WEIGHT (LBS)"
                        value={measurements.weight}
                        onChange={(e) => setMeasurements({...measurements, weight: e.target.value})}
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white font-black italic tracking-tight focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
                  <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 italic">Training Context</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={background.experience}
                      onChange={(e) => setBackground({...background, experience: e.target.value as any})}
                      className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white font-black italic tracking-tight outline-none"
                    >
                      {trainingExperiences.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                    </select>
                    <select
                      value={background.activity}
                      onChange={(e) => setBackground({...background, activity: e.target.value as any})}
                      className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white font-black italic tracking-tight outline-none"
                    >
                      {activityLevels.map(lvl => <option key={lvl.id} value={lvl.id}>{lvl.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
                  <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 italic">Symmetry Metrics (IN)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'shoulders', label: 'SHOULDERS*' },
                      { id: 'waist', label: 'WAIST*' },
                      { id: 'chest', label: 'CHEST' },
                      { id: 'arms', label: 'ARMS' },
                    ].map(f => (
                      <div key={f.id}>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block ml-1">{f.label}</label>
                        <input
                          type="number" step="0.1" placeholder="0.0"
                          value={(measurements as any)[f.id]}
                          onChange={(e) => setMeasurements({...measurements, [f.id]: e.target.value})}
                          className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-white font-black italic focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 p-6 bg-indigo-600/10 border border-indigo-500/30 rounded-3xl text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 blur-xl" />
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Current V-Taper Index</p>
                    <p className="text-4xl font-black text-white italic tracking-tighter">{currentRatio}:1</p>
                    {parseFloat(currentRatio) > 0 && parseFloat(currentRatio) < 1.4 && (
                      <p className="text-[10px] font-bold text-amber-400 mt-2 uppercase tracking-widest">
                        Focus needed on shoulder width and waist density reduction.
                      </p>
                    )}
                    {parseFloat(currentRatio) >= 1.5 && (
                      <p className="text-[10px] font-bold text-emerald-400 mt-2 uppercase tracking-widest">
                        Elite Symmetry Detected. Maintaining Trajectory.
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
                  <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 italic">Progress Photos (Optional)</h3>
                  <div className="border-2 border-dashed border-white/5 rounded-[2rem] p-8 text-center group hover:border-indigo-500/30 transition-all cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      id="photo-upload"
                      onChange={(e) => setPhotos(Array.from(e.target.files || []))}
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <span className="material-symbols-outlined text-4xl text-slate-600 mb-2 group-hover:text-indigo-400 transition-colors">cloud_upload</span>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Tap to upload skeletal scans</p>
                      {photos.length > 0 && <p className="text-[10px] text-indigo-400 mt-2 font-black">{photos.length} SCANS SELECTED</p>}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Deployment */}
        {currentStep === 2 && (
          <div className="animate-fade-in space-y-10 text-center py-10">
            <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-indigo-600/50">
              <SparklesIcon className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Protocol Deployment</h2>
              <p className="text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
                Our architecture engine is synthesizing your elite <span className="text-indigo-400 font-bold">{selectedTimeline}-week</span> {selectedGoalId.replace('_', ' ')} protocol.
              </p>
            </div>
            
            <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-[2rem] p-8 max-w-sm mx-auto space-y-3 text-left">
               <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 italic">Blueprint Initialization</p>
               <div className="flex justify-between text-xs text-white"><span>Objective</span><span className="font-black uppercase italic">{selectedGoalId.replace('_', ' ')}</span></div>
               <div className="flex justify-between text-xs text-white"><span>Initial Ratio</span><span className="font-black italic">{currentRatio}</span></div>
               <div className="flex justify-between text-xs text-white"><span>Training Level</span><span className="font-black uppercase italic">{background.experience}</span></div>
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
            onClick={currentStep === 2 ? handleFinalize : handleNext}
            disabled={loading || isGenerating}
            className="flex-1 bg-white text-black font-black uppercase italic tracking-widest h-16 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center gap-3">
                <LoadingSpinner size="sm" />
                <span className="animate-pulse">Synthesizing Protocol...</span>
              </div>
            ) : currentStep === 2 ? 'Deploy Architecture' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
