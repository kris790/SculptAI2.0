
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import AuthForm from '@/components/AuthForm';
import Dashboard from '@/components/Dashboard';
import WorkoutLogger from '@/components/WorkoutLogger';
import WorkoutHistory from '@/components/WorkoutHistory';
import ProgressTracker from '@/components/ProgressTracker';
import CommunityDashboard from '@/components/CommunityDashboard';
import CoachMarketplace from '@/components/CoachMarketplace';
import UserProfile from '@/components/UserProfile';
import LandingPage from '@/components/LandingPage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { GoogleGenAI } from "@google/genai";
import { SparklesIcon } from '@/components/icons';

export default function Home() {
  const { user, signOut, loading, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'log' | 'history' | 'progress' | 'community' | 'coaches' | 'profile'>('dashboard');
  const [aiInsight, setAiInsight] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const generatePhysiqueInsight = useCallback(async () => {
    if (aiInsight || aiLoading || !user) return;
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `As an elite physique competition coach for V-Taper Pro, provide a sharp, professional 2-sentence tip for an athlete. Current goal: ${profile?.fitness_goal || 'physique development'}. Focus on reaching the 1.5:1 shoulder-to-waist ratio golden standard.`,
      });
      setAiInsight(response.text || "Prioritize high-volume lateral raise variations to widen your frame.");
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  }, [user, profile?.fitness_goal, aiInsight, aiLoading]);

  useEffect(() => {
    if (user && activeTab === 'dashboard') {
      generatePhysiqueInsight();
    }
  }, [user, activeTab, generatePhysiqueInsight]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If not logged in, show the Landing Page (with option to show AuthForm)
  if (!user) {
    if (showAuth) {
      return (
        <div className="min-h-screen bg-[#101722] flex flex-col items-center justify-center p-4">
          <button 
            onClick={() => setShowAuth(false)}
            className="mb-8 text-[#3981f3] font-bold hover:underline flex items-center gap-2"
          >
            &larr; Back to Home
          </button>
          <AuthForm />
        </div>
      );
    }
    return <LandingPage onGetStarted={() => setShowAuth(true)} onLogin={() => setShowAuth(true)} />;
  }

  // If logged in, show the main App Dashboard
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-indigo-500/30">
      <header className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/40">
              <span className="text-white font-black text-xl">V</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              V-Taper<span className="text-indigo-400">Pro</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Comp Prep Mode</span>
            </div>
            <button onClick={signOut} className="text-sm font-semibold text-slate-400 hover:text-red-400 transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-[#1e293b]/30 border-b border-slate-800 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'progress', label: 'Physique', icon: '📏' },
              { id: 'log', label: 'Train', icon: '⚡' },
              { id: 'history', label: 'Logs', icon: '📋' },
              { id: 'community', label: 'Network', icon: '👥' },
              { id: 'coaches', label: 'Pros', icon: '🏆' },
              { id: 'profile', label: 'Profile', icon: '👤' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-4 border-b-2 font-medium text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-white bg-indigo-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {activeTab === 'dashboard' && aiInsight && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600/10 via-slate-800/50 to-purple-600/10 border border-indigo-500/30 rounded-2xl p-6 shadow-xl flex gap-4">
             <div className="p-3 bg-indigo-600 rounded-xl h-fit shadow-lg shadow-indigo-600/20">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <div className="relative z-10">
                <h3 className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-1">Coach Insight</h3>
                <p className="text-white text-lg font-medium italic leading-snug">"{aiInsight}"</p>
              </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'log' && <WorkoutLogger onWorkoutComplete={() => setActiveTab('history')} />}
          {activeTab === 'history' && <WorkoutHistory />}
          {activeTab === 'progress' && <ProgressTracker />}
          {activeTab === 'community' && <CommunityDashboard />}
          {activeTab === 'coaches' && <CoachMarketplace />}
          {activeTab === 'profile' && <UserProfile />}
        </div>
      </main>
    </div>
  );
}
