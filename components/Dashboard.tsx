
import React, { useMemo, useState } from 'react';
import { useWorkouts } from '../lib/hooks/useWorkouts';
import { useProgressLogs } from '../lib/hooks/useProgressLogs';
import { useAuth } from './AuthProvider';
import { LoadingSpinner } from './ui/LoadingSpinner';
import AIRecommendationsPanel from './ai/AIRecommendationsPanel';
import ProgressDashboard from './analytics/ProgressDashboard';
import { SparklesIcon, ChevronDownIcon } from './icons';

interface DashboardProps {
  onNavigate?: (tab: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { workouts, loading: workoutsLoading } = useWorkouts();
  const { logs, loading: logsLoading } = useProgressLogs();
  const { profile, userProfile } = useAuth();
  const [showBlueprint, setShowBlueprint] = useState(false);

  const totalWorkouts = workouts.length;
  const latestLog = logs.length > 0 ? logs[0] : null;
  
  const currentRatio = useMemo(() => {
    if (latestLog && latestLog.shoulders && latestLog.waist) {
      return (latestLog.shoulders / latestLog.waist).toFixed(2);
    }
    return 'N/A';
  }, [latestLog]);

  const needsGoal = !profile?.fitness_goal;
  const needsLogs = logs.length === 0;

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {workoutsLoading || logsLoading ? (
        <div className="flex justify-center items-center p-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Athletic Hub</h2>
              <p className="text-slate-400 font-medium text-lg">Your foundation for an elite physique.</p>
            </div>
            <div className="bg-indigo-600/10 border border-indigo-500/20 px-6 py-3 rounded-2xl flex items-center gap-4">
              <div className="text-left">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Training Streak</p>
                <p className="text-xl font-black text-white italic">6 WEEKS</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg shadow-[0_0_15px_rgba(79,70,229,0.5)]">🔥</div>
            </div>
          </div>

          {/* Architecture Scan (Onboarding Prompt) */}
          {(needsGoal || needsLogs) && (
            <div className="bg-gradient-to-r from-indigo-900/60 to-slate-900 border border-indigo-500/50 rounded-[2.5rem] p-10 md:p-14 shadow-2xl relative overflow-hidden animate-fade-in">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 blur-[120px] -z-10" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl">
                      <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Architecture Required</h3>
                  </div>
                  
                  <p className="text-slate-300 text-lg font-medium leading-relaxed max-w-xl">
                    To architect your ideal frame, the AI needs your structural data. Provide your objectives (Lose Weight, Build Muscle, Body Recomp) and measurements (Shoulders, Waist, Chest) to unlock your custom program.
                  </p>

                  <button 
                    onClick={() => onNavigate?.('profile')}
                    className="group bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 px-10 rounded-2xl uppercase tracking-[0.2em] italic transition-all flex items-center gap-3 shadow-2xl shadow-indigo-600/40"
                  >
                    Initialize Architecture Scan
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
                </div>
                
                <div className="hidden lg:block w-px h-40 bg-white/10" />
                
                <div className="hidden lg:grid grid-cols-2 gap-4">
                   <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">V-Taper</p>
                     <p className="text-white font-bold italic">1.50 Target</p>
                   </div>
                   <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Timeline</p>
                     <p className="text-white font-bold italic">12-27 Weeks</p>
                   </div>
                   <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center col-span-2">
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Form Assistant</p>
                     <p className="text-white font-bold italic">Real-time Vision</p>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Blueprint Section */}
          {!needsGoal && userProfile?.bio && (
            <div className="bg-slate-900 border border-indigo-500/20 rounded-[2.5rem] p-10 shadow-xl overflow-hidden group">
              <button 
                onClick={() => setShowBlueprint(!showBlueprint)}
                className="w-full flex justify-between items-center group/btn"
              >
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/30 group-hover/btn:scale-105 transition-transform">
                    <SparklesIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">My Architectural Blueprint</h3>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-1">Generated Personal Protocol v4.0</p>
                  </div>
                </div>
                <div className={`p-2 rounded-full bg-white/5 text-slate-400 transition-transform duration-500 ${showBlueprint ? 'rotate-180 bg-indigo-500/10 text-indigo-400' : ''}`}>
                  <ChevronDownIcon className="w-6 h-6" />
                </div>
              </button>

              {showBlueprint && (
                <div className="mt-10 animate-fade-in border-t border-white/5 pt-10">
                  <div className="prose prose-invert prose-indigo max-w-none">
                    <div className="text-slate-300 whitespace-pre-line font-medium leading-relaxed text-lg">
                      {userProfile.bio}
                    </div>
                  </div>
                  <div className="mt-12 p-8 bg-indigo-600/5 border border-indigo-500/10 rounded-[2rem] flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 text-center md:text-left">
                      <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Protocol Note</p>
                      <p className="text-sm text-slate-400 italic">This blueprint updates based on your weekly architecture scans. Log measurements consistently for optimal AI calibration.</p>
                    </div>
                    <button 
                      onClick={() => onNavigate?.('progress')}
                      className="whitespace-nowrap bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black py-4 px-8 rounded-2xl uppercase tracking-widest text-[10px] transition-all"
                    >
                      Update Scan Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 shadow-xl relative overflow-hidden group hover:border-indigo-500/30 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-3xl -z-0" />
              <div className="relative z-10">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Physique Ratio</p>
                <p className="text-5xl font-black text-white italic tracking-tighter">{currentRatio}</p>
                <div className="mt-6 flex items-center gap-3">
                    <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden">
                        <div 
                            className="bg-indigo-500 h-full shadow-[0_0_12px_rgba(99,102,241,0.6)]" 
                            style={{ width: `${Math.min(100, (parseFloat(currentRatio === 'N/A' ? '0' : currentRatio) / 1.5) * 100)}%` }}
                        ></div>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">1.50</span>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 shadow-xl group hover:border-emerald-500/30 transition-all">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2">Current Phase</p>
              <p className="text-2xl font-black text-white italic mb-4 uppercase tracking-tight">
                {profile?.fitness_goal ? profile.fitness_goal.replace('_', ' ') : 'Architecture Setup'}
              </p>
              <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">Status</span>
                    <span className="text-emerald-400">{profile?.fitness_goal ? 'ACTIVE' : 'INITIALIZING'}</span>
                 </div>
                 <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                 </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 shadow-xl hover:border-white/20 transition-all">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Total Training</p>
              <p className="text-5xl font-black text-white italic tracking-tighter">{totalWorkouts}</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Sessions Logged</p>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 shadow-xl hover:border-white/20 transition-all">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Current Weight</p>
              <p className="text-5xl font-black text-white italic tracking-tighter">{latestLog?.weight || '--'}</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">LBS (Imperial)</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <AIRecommendationsPanel />
              <ProgressDashboard />
            </div>

            <div className="space-y-8">
              <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -z-0" />
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8 italic">Sculpting Goals</h3>
                <div className="space-y-6">
                  {[
                    { label: 'Shoulder Width Index', progress: 85, color: 'bg-indigo-500' },
                    { label: 'Symmetry Ratio', progress: 42, color: 'bg-indigo-400' },
                    { label: 'Lat Spread Volume', progress: 30, color: 'bg-cyan-500' },
                  ].map((goal) => (
                    <div key={goal.label} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">{goal.label}</span>
                        <span className="text-white">{goal.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${goal.color} shadow-[0_0_8px_rgba(99,102,241,0.3)]`} style={{ width: `${goal.progress}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phase 4 Live: Pose Architecture */}
              <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-3xl p-8 relative group overflow-hidden shadow-[0_0_30px_rgba(79,70,229,0.1)]">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-600 rounded-lg shadow-lg">
                    <SparklesIcon className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Phase 4 Active</h4>
                </div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-2">Pose Architect</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-medium mb-6">
                  Experience AI-powered live posing feedback to maximize your frame's visual impact on stage.
                </p>
                <button 
                  onClick={() => onNavigate?.('pose')}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 border border-indigo-400 text-white font-black py-3 rounded-xl uppercase text-[10px] tracking-widest transition-all"
                >
                  Enter Posing Suite
                </button>
              </div>

              <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 relative group overflow-hidden">
                <p className="text-sm text-indigo-200 leading-relaxed font-bold italic">
                  "Architecture before decoration. Master the compound patterns now; the aesthetic details will follow the strength."
                </p>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-4">— ELITE COACH CORE</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
