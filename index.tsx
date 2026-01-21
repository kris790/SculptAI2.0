
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider, useAuth } from './components/AuthProvider';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import WorkoutLogger from './components/WorkoutLogger';
import WorkoutHistory from './components/WorkoutHistory';
import ProgressTracker from './components/ProgressTracker';
import CommunityDashboard from './components/CommunityDashboard';
import CoachMarketplace from './components/CoachMarketplace';
import UserProfile from './components/UserProfile';
import LandingPage from './components/LandingPage';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { GoogleGenAI } from "@google/genai";
import { SparklesIcon } from './components/icons';

const MainApp = () => {
  const { user, signOut, loading, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'log' | 'history' | 'progress' | 'community' | 'coaches' | 'profile'>('dashboard');
  const [aiInsight, setAiInsight] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  
  const isGuest = !user;

  const activeProfile = useMemo(() => profile || {
    full_name: 'Sculpt Guest',
    fitness_goal: 'build_muscle',
    gender: 'male',
    height: 180,
    weight: 185
  }, [profile]);

  const generatePhysiqueInsight = useCallback(async () => {
    if (aiInsight || aiLoading || !user) return;
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        You are SculptAI, a world-class physique architecture coach. 
        The user is a beginner aiming for: ${activeProfile.fitness_goal}.
        User Details: ${activeProfile.gender}, ${activeProfile.height}cm, ${activeProfile.weight} lbs.
        
        Provide a concise, high-impact coaching tip (max 2 sentences). 
        Focus on foundational "Sculpting" principles like frame width development, core control, or the "V-taper" aesthetic.
        Be encouraging but maintain an elite, professional tone.
        Speak directly to the user.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAiInsight(response.text || "Prioritize mind-muscle connection in your lateral raises to widen the skeletal silhouette.");
    } catch (err) {
      console.error("Gemini Insight Error:", err);
      setAiInsight("Consistency is the architect of change. Master your movement patterns today for an elite frame tomorrow.");
    } finally {
      setAiLoading(false);
    }
  }, [activeProfile, aiInsight, aiLoading, user]);

  useEffect(() => {
    if (activeTab === 'dashboard' && user) {
      generatePhysiqueInsight();
    }
  }, [activeTab, user, generatePhysiqueInsight]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user && !showAuth) {
    return <LandingPage onGetStarted={() => setShowAuth(true)} onLogin={() => setShowAuth(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-['Space_Grotesk'] selection:bg-indigo-500/30">
      <header className="sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
              <span className="text-white font-black text-xl italic">S</span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-white uppercase italic hidden sm:block">
              SCULPT<span className="text-indigo-400">AI</span>
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {!isGuest && (
              <div className="hidden md:flex items-center gap-2.5 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                <div className={`w-1.5 h-1.5 rounded-full bg-indigo-500 ${aiLoading ? 'animate-ping' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
                  {aiLoading ? "Coaching..." : "AI Intelligence Active"}
                </span>
              </div>
            )}
            
            {user ? (
              <button onClick={signOut} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-red-400 transition-colors">
                SIGN OUT
              </button>
            ) : (
              <button onClick={() => setShowAuth(false)} className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:text-indigo-300 transition-colors">
                BACK HOME
              </button>
            )}
          </div>
        </div>
      </header>

      <nav className="bg-[#0f172a]/50 border-b border-white/5 overflow-x-auto no-scrollbar backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
            {[
              { id: 'dashboard', label: 'HUB', icon: '📊' },
              { id: 'log', label: 'TRAIN', icon: '⚡' },
              { id: 'history', label: 'LOGS', icon: '📋' },
              { id: 'progress', label: 'SCULPT', icon: '📏' },
              { id: 'community', label: 'NETWORK', icon: '👥' },
              { id: 'coaches', label: 'PROS', icon: '🏆' },
              { id: 'profile', label: 'ME', icon: '👤' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-6 font-black text-[10px] uppercase tracking-widest transition-all relative flex items-center gap-2.5 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {activeTab === 'dashboard' && user && (aiInsight || aiLoading) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-indigo-600/5 blur-3xl rounded-full transition-all group-hover:bg-indigo-600/10" />
            <div className="relative overflow-hidden bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="p-4 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/30 group-hover:scale-110 transition-transform">
                  <SparklesIcon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">COACH INTEL v4.0</h3>
                  {aiLoading ? (
                    <div className="space-y-3">
                      <div className="h-5 w-full bg-white/5 animate-pulse rounded-lg"></div>
                      <div className="h-5 w-2/3 bg-white/5 animate-pulse rounded-lg"></div>
                    </div>
                  ) : (
                    <p className="text-xl md:text-2xl text-white font-bold leading-tight italic tracking-tight">"{aiInsight}"</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32">
        <div className="animate-fade-in">
          {user ? (
            <>
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'log' && <WorkoutLogger onWorkoutComplete={() => setActiveTab('history')} />}
              {activeTab === 'history' && <WorkoutHistory />}
              {activeTab === 'progress' && <ProgressTracker />}
              {activeTab === 'community' && <CommunityDashboard />}
              {activeTab === 'coaches' && <CoachMarketplace />}
              {activeTab === 'profile' && <UserProfile />}
            </>
          ) : (
            <div className="flex justify-center py-12">
              <AuthForm />
            </div>
          )}
        </div>
      </main>
      
      {/* Mobile-only Bottom Tab Padding */}
      <div className="h-12 md:hidden" />
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </React.StrictMode>
  );
}
