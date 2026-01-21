
import React, { useState, useEffect, useCallback } from 'react';
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
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { GoogleGenAI } from "@google/genai";
import { SparklesIcon } from './components/icons';

const MainApp = () => {
  const { user, signOut, loading, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'log' | 'history' | 'progress' | 'community' | 'coaches' | 'profile'>('dashboard');
  const [aiInsight, setAiInsight] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  
  const isGuest = !user;
  const activeProfile = profile || {
    full_name: 'Sculpt Guest',
    fitness_goal: 'build_muscle',
    gender: 'male',
    height: 180,
    weight: 185
  };

  const generatePhysiqueInsight = useCallback(async () => {
    if (aiInsight || aiLoading) return;
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        You are SculptAI, an expert physique coach. 
        User Goal: ${activeProfile.fitness_goal}.
        User Details: ${activeProfile.gender}, ${activeProfile.height}cm, ${activeProfile.weight} lbs.
        
        Provide a concise, motivating, and professional 2-sentence coaching tip for this user. 
        Focus on the "V-Taper" physique (broad shoulders, narrow waist) or their specific goal.
        Speak directly to the user.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAiInsight(response.text || "Keep pushing your limits! Consistency is the key to a legendary physique.");
    } catch (err) {
      console.error("Gemini Insight Error:", err);
      setAiInsight("Maintain consistent progressive overload in your lat pull-downs to widen that V-taper frame.");
    } finally {
      setAiLoading(false);
    }
  }, [activeProfile, aiInsight, aiLoading]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      generatePhysiqueInsight();
    }
  }, [activeTab, generatePhysiqueInsight]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-indigo-500/30">
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <header className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <span className="text-white font-black text-xl">V</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-white hidden sm:block">
                  V-Taper<span className="text-indigo-400">Pro</span>
                </h1>
              </div>

              <div className="flex items-center gap-4">
                {isGuest && (
                  <span className="text-[10px] uppercase tracking-widest font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20">
                    Demo Mode
                  </span>
                )}
                
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                  <SparklesIcon className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <span className="text-xs font-medium text-indigo-300">
                    {aiLoading ? "Analyzing physique..." : "Coach Insight Active"}
                  </span>
                </div>
                
                {user ? (
                  <button onClick={signOut} className="text-sm font-semibold text-slate-400 hover:text-red-400 transition-colors">
                    Sign Out
                  </button>
                ) : (
                  <button onClick={() => setActiveTab('profile')} className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </header>

          <nav className="bg-[#1e293b]/30 border-b border-slate-800 overflow-x-auto no-scrollbar">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex space-x-1 sm:space-x-4">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                  { id: 'log', label: 'Train', icon: '⚡' },
                  { id: 'history', label: 'Logs', icon: '📋' },
                  { id: 'progress', label: 'Physique', icon: '📏' },
                  { id: 'community', label: 'Network', icon: '👥' },
                  { id: 'coaches', label: 'Pros', icon: '🏆' },
                  { id: 'profile', label: 'Profile', icon: '👤' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-4 border-b-2 font-medium text-sm transition-all relative flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-white bg-indigo-500/5'
                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                    {activeTab === tab.id && (
                      <span className="absolute bottom-[-2px] left-0 w-full h-[2px] bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </nav>

          {activeTab === 'dashboard' && (aiInsight || aiLoading) && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl p-6 shadow-xl">
                <div className="relative z-10 flex items-start gap-4">
                  <div className="p-3 bg-indigo-600 rounded-xl shadow-lg">
                    <SparklesIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-1">Coach Insight</h3>
                    {aiLoading ? (
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-slate-700 animate-pulse rounded"></div>
                        <div className="h-4 w-2/3 bg-slate-700 animate-pulse rounded"></div>
                      </div>
                    ) : (
                      <p className="text-lg text-white font-medium leading-relaxed italic">"{aiInsight}"</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
            <div className="transition-all duration-300 ease-in-out">
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'log' && <WorkoutLogger onWorkoutComplete={() => setActiveTab('history')} />}
              {activeTab === 'history' && <WorkoutHistory />}
              {activeTab === 'progress' && <ProgressTracker />}
              {activeTab === 'community' && <CommunityDashboard />}
              {activeTab === 'coaches' && <CoachMarketplace />}
              {activeTab === 'profile' && (user ? <UserProfile /> : <AuthForm />)}
            </div>
          </main>
        </>
      )}
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
