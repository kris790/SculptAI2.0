
import React, { useMemo, useState } from 'react';
import { useAuth } from './AuthProvider';
import { useDummyData } from '../context/DummyDataContext';
import { LoadingSpinner } from './ui/LoadingSpinner';
import ProgressDashboard from './analytics/ProgressDashboard';
import { SymmetryVisualizer } from './analytics/SymmetryVisualizer';
import { SparklesIcon, ChevronDownIcon, CheckIcon, TrophyIcon } from './icons';

interface DashboardProps {
  onNavigate?: (tab: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { profile, userProfile, user } = useAuth();
  const { 
    currentUser, 
    aiProgram, 
    aiRecommendations, 
    addMeasurement, 
    refreshData 
  } = useDummyData();
  const [showBlueprint, setShowBlueprint] = useState(false);

  // Journey state mapping for the Mermaid flow
  const journeySteps = useMemo(() => [
    { label: 'LANDED', complete: true },
    { label: 'GOAL', complete: !!(profile?.fitness_goal || currentUser.goal) },
    { label: 'METRICS', complete: currentUser.measurements.length > 0 },
    { label: 'PROGRAM', complete: !!aiProgram },
    { label: 'TRACKING', complete: currentUser.workouts.length > 0 }
  ], [profile, currentUser, aiProgram]);

  const latestLog = currentUser.measurements[currentUser.measurements.length - 1];
  const lastWorkout = currentUser.workouts[0];
  const currentRatio = latestLog?.calculatedRatio.toFixed(2) || '0.00';
  const totalWorkouts = currentUser.workouts.length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Journey Progress Bar */}
      <div className="bg-white/5 border border-white/10 rounded-full p-2 hidden md:flex items-center gap-2">
        {journeySteps.map((step, i) => (
          <React.Fragment key={step.label}>
            <div className="flex items-center gap-2 px-4 py-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black ${step.complete ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                {step.complete ? <CheckIcon className="w-3 h-3" /> : i + 1}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${step.complete ? 'text-white' : 'text-slate-500'}`}>
                {step.label}
              </span>
            </div>
            {/* // Fix: Removed invalid 'if' statement inside JSX expression. Replaced with logical AND. */}
            {i < journeySteps.length - 1 && <div className="h-px flex-1 bg-white/10 mx-2" />}
          </React.Fragment>
        ))}
      </div>

      {/* PRIMARY ACTION HUB - Prominent Navigation Button */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 rounded-[2.5rem] p-1 px-1 shadow-2xl shadow-indigo-600/20">
        <div className="bg-[#0f172a]/40 backdrop-blur-xl rounded-[2.4rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-2xl rotate-3 group hover:rotate-0 transition-transform duration-500">
              <span className="material-symbols-outlined text-indigo-600 text-4xl font-black animate-pulse">bolt</span>
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Current Protocol Active</h3>
              <p className="text-indigo-200/70 text-sm font-medium">Initialize your daily training session to continue your symmetry trajectory.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={() => onNavigate?.('log')}
              className="flex-1 md:flex-none px-10 py-5 bg-white text-indigo-600 rounded-2xl font-black uppercase italic tracking-widest shadow-xl hover:scale-[1.03] transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              Start Workout
              <span className="material-symbols-outlined font-black">arrow_forward</span>
            </button>
            <button 
              onClick={() => onNavigate?.('history')}
              className="p-5 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center"
              title="View History"
            >
              <span className="material-symbols-outlined">history</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Athletic Hub</h2>
          <p className="text-slate-400 font-medium text-lg">Elite architecture protocols for {currentUser.name}.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="bg-indigo-600/10 border border-indigo-500/20 px-6 py-3 rounded-2xl flex items-center gap-4 flex-1 md:flex-none">
            <div className="text-left">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Streak</p>
              <p className="text-xl font-black text-white italic">6 WEEKS</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg shadow-[0_0_15px_rgba(79,70,229,0.5)]">🔥</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-6">
          <SymmetryVisualizer 
            shoulders={latestLog?.shoulders || 1.2} 
            waist={latestLog?.waist || 1} 
            gender={profile?.gender || 'male'} 
          />
          
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 shadow-xl relative overflow-hidden group hover:border-indigo-500/30 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-3xl -z-0" />
            <div className="relative z-10">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Physique Ratio</p>
              <p className="text-5xl font-black text-white italic tracking-tighter">{currentRatio}</p>
              <p className="text-slate-500 text-xs font-bold uppercase mt-1">Target: {currentUser.targetRatio}</p>
              <div className="mt-6 flex items-center gap-3">
                  <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden">
                      <div 
                          className="bg-indigo-500 h-full shadow-[0_0_12px_rgba(99,102,241,0.6)]" 
                          style={{ width: `${Math.min(100, (parseFloat(currentRatio) / currentUser.targetRatio) * 100)}%` }}
                      ></div>
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{currentUser.targetRatio}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Last Activity</h3>
              {lastWorkout ? (
                <div className="space-y-2">
                  <p className="text-xl font-black text-white uppercase italic">{lastWorkout.type}</p>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                    {new Date(lastWorkout.date).toLocaleDateString()} • {lastWorkout.duration} MIN
                  </p>
                  <div className="flex gap-2 mt-4">
                    {lastWorkout.exercises.slice(0, 3).map((ex, i) => (
                      <span key={i} className="px-2 py-1 bg-white/5 rounded-lg text-[8px] font-black text-slate-400 uppercase tracking-widest border border-white/5">
                        {ex.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 italic text-sm font-medium">No sessions recorded yet.</p>
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-indigo-500/20 rounded-[2.5rem] p-8 shadow-xl overflow-hidden group">
            <button 
              onClick={() => setShowBlueprint(!showBlueprint)}
              className="w-full flex justify-between items-center group/btn"
            >
              <div className="flex items-center gap-6">
                <div className="p-4 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/30 group-hover/btn:scale-105 transition-transform">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">My Architectural Blueprint</h3>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-1">
                    Week {aiProgram?.workouts.length || 0} of {currentUser.timelineWeeks}
                  </p>
                </div>
              </div>
              <div className={`p-2 rounded-full bg-white/5 text-slate-400 transition-transform duration-500 ${showBlueprint ? 'rotate-180 bg-indigo-500/10 text-indigo-400' : ''}`}>
                <ChevronDownIcon className="w-6 h-6" />
              </div>
            </button>

            {showBlueprint && (
              <div className="mt-8 animate-fade-in border-t border-white/5 pt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 italic">Protocol Focus</h4>
                    <p className="text-white text-lg font-bold italic mb-4">{aiProgram?.focus}</p>
                    <div className="space-y-2">
                      {aiProgram?.schedule.map((day, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm text-slate-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" />
                          {day}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 italic">Metabolic Targets</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Protein</p>
                        <p className="text-xl font-black text-white italic">{aiProgram?.macroTargets.protein}g</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Calories</p>
                        <p className="text-xl font-black text-white italic">{aiProgram?.macroTargets.calories}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Carbs</p>
                        <p className="text-xl font-black text-white italic">{aiProgram?.macroTargets.carbs}g</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Fats</p>
                        <p className="text-xl font-black text-white italic">{aiProgram?.macroTargets.fats}g</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Recommendations Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
              <span className="p-1.5 bg-indigo-600 rounded-lg">
                <SparklesIcon className="w-4 h-4 text-white" />
              </span>
              Coaching Adaptations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aiRecommendations.map((rec) => (
                <div key={rec.id} className="bg-slate-900 border border-white/5 rounded-3xl p-6 hover:border-indigo-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-black text-white uppercase italic text-sm tracking-tight">{rec.title}</h4>
                    <span className={`text-[8px] px-2 py-1 rounded-full font-black uppercase tracking-widest ${
                      rec.priority === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                      rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20' :
                      'bg-green-500/20 text-green-400 border border-green-500/20'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-6 font-medium leading-relaxed italic">"{rec.description}"</p>
                  <div className="space-y-3">
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Protocol Adjustments:</p>
                    <ul className="space-y-2">
                      {rec.actionSteps.map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-xs text-slate-300 font-medium">
                          <span className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-10 border-t border-white/5">
         <ProgressDashboard />
      </div>

      {/* Phase 4 Live: Pose Architecture */}
      <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-3xl p-8 relative group overflow-hidden shadow-[0_0_30px_rgba(79,70,229,0.1)] flex flex-col md:flex-row items-center gap-8">
        <div className="absolute -right-4 -top-4 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
        
        <div className="shrink-0 p-6 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-600/40">
          <SparklesIcon className="w-12 h-12 text-white" />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-3xl font-black text-white uppercase italic tracking-tight mb-2">Pose Architect Live</h3>
          <p className="text-slate-400 leading-relaxed font-medium mb-0 max-w-2xl">
            Experience AI-powered live posing feedback to maximize your frame's visual impact on stage. Sub-200ms latency for real-time skeletal corrections.
          </p>
        </div>
        
        <button 
          onClick={() => onNavigate?.('pose')}
          className="whitespace-nowrap bg-indigo-600 hover:bg-indigo-50 border border-indigo-400 text-white font-black px-10 py-5 rounded-2xl uppercase tracking-widest italic transition-all shadow-xl shadow-indigo-600/40 active:scale-95"
        >
          Enter Posing Suite
        </button>
      </div>
    </div>
  );
}
