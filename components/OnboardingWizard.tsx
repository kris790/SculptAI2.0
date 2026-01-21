
import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabaseClient';
import { useAsyncAction } from '../lib/hooks/useAsyncAction';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { SparklesIcon } from './icons';
import { generateTrainingProgram } from '../lib/ai/program-generator';
import { GoalCard } from './onboarding/GoalCard';

interface OnboardingWizardProps {
  onComplete: () => void;
}

const goals = [
  {
    id: 'lose_weight',
    title: 'Lose Weight',
    description: 'Focus on fat loss while maintaining skeletal structure.',
    icon: '⚖️',
    targetRatio: 1.4,
    timeline: [12, 16, 20],
  },
  {
    id: 'build_muscle',
    title: 'Gain Muscle',
    description: 'Build lean mass with hypertrophy focus to widen the frame.',
    icon: '💪',
    targetRatio: 1.5,
    timeline: [16, 20, 24],
  },
  {
    id: 'body_recomp',
    title: 'Body Recomposition',
    description: 'Lose fat & gain muscle simultaneously for elite symmetry.',
    icon: '🔄',
    targetRatio: 1.45,
    timeline: [16, 20, 24],
  },
  {
    id: 'competition_prep',
    title: 'Competition Prep',
    description: '27-week stage-ready physique refinement protocol.',
    icon: '🏆',
    targetRatio: 1.5,
    timeline: [27],
  },
];

const measurementFields = [
  { name: 'shoulders', label: 'Shoulders (inches)', required: true },
  { name: 'waist', label: 'Waist (inches)', required: true },
  { name: 'chest', label: 'Chest (inches)' },
  { name: 'arms', label: 'Arms (inches)' },
  { name: 'quads', label: 'Quads (inches)' },
  { name: 'calves', label: 'Calves (inches)' },
  { name: 'weight', label: 'Weight (lbs)', required: true },
  { name: 'bodyFat', label: 'Body Fat %' },
];

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { user, refreshProfile } = useAuth();
  const { execute, loading } = useAsyncAction();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // State for Goal Selection
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [selectedTimeline, setSelectedTimeline] = useState<number>(0);
  
  // State for Measurements
  const [bio, setBio] = useState({
    fullName: '',
    age: '',
    height: '',
    gender: 'male' as const,
    experience: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced'
  });

  const [measurements, setMeasurements] = useState<Record<string, string>>({
    shoulders: '',
    waist: '',
    chest: '',
    arms: '',
    quads: '',
    calves: '',
    weight: '',
    bodyFat: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateGoalStep = () => {
    if (!selectedGoal || !selectedTimeline) {
      setErrors({ goal: 'Selection required to proceed.' });
      return false;
    }
    return true;
  };

  const validateMeasurementStep = () => {
    const newErrors: Record<string, string> = {};
    if (!bio.fullName) newErrors.fullName = 'Required';
    if (!measurements.shoulders) newErrors.shoulders = 'Required';
    if (!measurements.waist) newErrors.waist = 'Required';
    if (!measurements.weight) newErrors.weight = 'Required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    setErrors({});
    if (currentStep === 0 && validateGoalStep()) setCurrentStep(1);
    else if (currentStep === 1 && validateMeasurementStep()) setCurrentStep(2);
  };

  const handleFinalize = async () => {
    if (!user) return;
    setIsGenerating(true);
    
    await execute(async () => {
      const currentRatio = (parseFloat(measurements.shoulders) / parseFloat(measurements.waist)).toFixed(2);
      const goalObj = goals.find(g => g.id === selectedGoal);

      const blueprint = await generateTrainingProgram({
        goal: selectedGoal,
        currentRatio,
        targetRatio: goalObj?.targetRatio || 1.5,
        timelineWeeks: selectedTimeline,
        bio: {
          ...bio,
          weight: measurements.weight,
          height: bio.height
        }
      });

      // Update basic profile
      const { error: pErr } = await supabase.from('profiles').update({
        full_name: bio.fullName,
        fitness_goal: selectedGoal,
        age: parseInt(bio.age),
        height: parseFloat(bio.height),
        weight: parseFloat(measurements.weight),
        gender: bio.gender,
      }).eq('id', user.id);
      if (pErr) throw pErr;

      // Update social profile with AI generated program
      const { error: upErr } = await supabase.from('user_profiles').update({
        experience_level: bio.experience,
        bio: blueprint
      }).eq('id', user.id);
      if (upErr) throw upErr;

      // Log initial metrics
      const { error: lErr } = await supabase.from('progress_logs').insert({
        user_id: user.id,
        log_date: new Date().toISOString().split('T')[0],
        weight: parseFloat(measurements.weight),
        shoulders: parseFloat(measurements.shoulders),
        waist: parseFloat(measurements.waist),
        chest: measurements.chest ? parseFloat(measurements.chest) : null,
        arms: measurements.arms ? parseFloat(measurements.arms) : null,
        thighs: measurements.quads ? parseFloat(measurements.quads) : null,
        body_fat_percentage: measurements.bodyFat ? parseFloat(measurements.bodyFat) : null,
        notes: `Onboarding Complete. Target Ratio: ${goalObj?.targetRatio}`
      });
      if (lErr) throw lErr;

      await refreshProfile();
      onComplete();
    });
    setIsGenerating(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f172a] p-4 sm:p-6 overflow-y-auto">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.12),transparent)] pointer-events-none" />
      
      <div className="max-w-4xl w-full bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative">
        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-12">
          {['Trajectory', 'Architecture', 'Initialize'].map((title, idx) => (
            <div key={title} className="flex-1 flex flex-col items-center">
              <div className={`h-1 w-full rounded-full transition-all duration-700 mb-4 ${idx <= currentStep ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-white/5'}`} />
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${idx <= currentStep ? 'text-indigo-400' : 'text-slate-600'}`}>
                {title}
              </p>
            </div>
          ))}
        </div>

        {/* Step 1: Goals */}
        {currentStep === 0 && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2 underline decoration-indigo-500 decoration-4 underline-offset-8">Aesthetic Trajectory</h2>
              <p className="text-slate-400 font-medium">Select your primary objective to calibrate your protocol.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  {...goal}
                  isSelected={selectedGoal === goal.id}
                  onSelect={() => {
                    setSelectedGoal(goal.id);
                    setSelectedTimeline(goal.timeline[0]);
                  }}
                />
              ))}
            </div>

            {selectedGoal && (
              <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 animate-fade-in">
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Select Phase Timeline</h3>
                <div className="flex flex-wrap gap-2">
                  {goals.find(g => g.id === selectedGoal)?.timeline.map((weeks) => (
                    <button
                      key={weeks}
                      onClick={() => setSelectedTimeline(weeks)}
                      className={`flex-1 min-w-[100px] py-4 rounded-xl font-black text-sm uppercase italic transition-all ${
                        selectedTimeline === weeks
                          ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
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

        {/* Step 2: Measurements */}
        {currentStep === 1 && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">Structural Scan</h2>
              <p className="text-slate-400 font-medium">Capture your architectural baseline for proportional tracking.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Personal Data */}
              <div className="lg:col-span-5 space-y-4">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Biological Profile</p>
                <div className="space-y-4">
                  <input
                    placeholder="Full Name"
                    value={bio.fullName}
                    onChange={(e) => setBio({...bio, fullName: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold italic outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number" placeholder="Age"
                      value={bio.age}
                      onChange={(e) => setBio({...bio, age: e.target.value})}
                      className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold italic outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <select
                      value={bio.gender}
                      onChange={(e) => setBio({...bio, gender: e.target.value as any})}
                      className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold italic outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <input
                    type="number" placeholder="Height (cm)"
                    value={bio.height}
                    onChange={(e) => setBio({...bio, height: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold italic outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <select
                    value={bio.experience}
                    onChange={(e) => setBio({...bio, experience: e.target.value as any})}
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold italic outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Beginner">Beginner (0-1yr)</option>
                    <option value="Intermediate">Intermediate (1-3yr)</option>
                    <option value="Advanced">Advanced (3+ yr)</option>
                  </select>
                </div>
              </div>

              {/* Measurements Grid */}
              <div className="lg:col-span-7 space-y-4">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Physique Metrics</p>
                <div className="grid grid-cols-2 gap-4">
                  {measurementFields.map((field) => (
                    <div key={field.name}>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block ml-1">
                        {field.label}{field.required && '*'}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={measurements[field.name]}
                        onChange={(e) => setMeasurements({...measurements, [field.name]: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-black italic focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {Object.keys(errors).length > 0 && <p className="text-center text-red-400 text-[10px] font-black uppercase tracking-widest">Mandatory fields required for symmetry calculation.</p>}
          </div>
        )}

        {/* Step 3: Deployment */}
        {currentStep === 2 && (
          <div className="animate-fade-in space-y-10 text-center py-10">
            <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-indigo-600/50">
              <SparklesIcon className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Protocol Deployment</h2>
              <p className="text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
                Our architecture engine is synthesizing your elite {selectedTimeline}-week {selectedGoal.replace('_', ' ')} protocol.
              </p>
            </div>
            
            <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-[2rem] p-8 max-w-sm mx-auto space-y-3 text-left">
               <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Blueprint Initialization</p>
               <div className="flex justify-between text-xs text-white"><span>User Profile</span><span className="font-black italic">{bio.fullName}</span></div>
               <div className="flex justify-between text-xs text-white"><span>Initial Ratio</span><span className="font-black italic">{(parseFloat(measurements.shoulders)/parseFloat(measurements.waist)).toFixed(2)}</span></div>
               <div className="flex justify-between text-xs text-white"><span>Timeline</span><span className="font-black italic">{selectedTimeline} WEEKS</span></div>
            </div>
          </div>
        )}

        {/* Footer */}
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
                <span className="animate-pulse">Synthesizing Architecture...</span>
              </div>
            ) : currentStep === 2 ? 'Deploy Protocol' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
