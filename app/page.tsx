'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import AuthForm from '@/components/AuthForm';
import Dashboard from '@/components/Dashboard';
import WorkoutLogger from '@/components/WorkoutLogger';
import WorkoutHistory from '@/components/WorkoutHistory';
import ProgressTracker from '@/components/ProgressTracker';
import CommunityDashboard from '@/components/CommunityDashboard';
import CoachMarketplace from '@/components/CoachMarketplace';
import UserProfile from '@/components/UserProfile';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { GoogleGenAI } from "@google/genai";
import { SparklesIcon } from '@/components/icons';

export default function Home() {
  const { user, signOut, loading, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'log' | 'history' | 'progress' | 'community' | 'coaches' | 'profile'>('dashboard');
  const [aiInsight, setAiInsight] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (user && activeTab === 'dashboard') {
      const generatePhysiqueInsight = async () => {
        if (aiInsight || aiLoading) return;
        setAiLoading(true);
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `As an expert physique coach for SculptAI, provide a 2-sentence motivating tip for a user with goal: ${profile?.fitness_goal || 'fitness improvement'}. Focus on the V-Taper aesthetic.`,
          });
          setAiInsight(response.text || "Focus on consistency to sculpt your best self.");
        } catch (err) {
          console.error(err);
        } finally {
          setAiLoading(false);
        }
      };
      generatePhysiqueInsight();
    }
  }, [user, activeTab, aiInsight, aiLoading, profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-indigo-500/30">
      <header className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xl">S</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Sculpt<span className="text-indigo-400">AI</span>
            </h1>
          </div>
          <button onClick={signOut} className="text-sm font-semibold text-slate-400 hover:text-red-400 transition-colors">
            Sign Out
          </button>
        </div>
      </header>

      <nav className="bg-[#1e293b]/30 border-b border-slate-800 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'log', label: 'Workout' },
              { id: 'history', label: 'History' },
              { id: 'progress', label: 'Progress' },
              { id: 'community', label: 'Social' },
              { id: 'coaches', label: 'Coaches' },
              { id: 'profile', label: 'Profile' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-4 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-white bg-indigo-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {activeTab === 'dashboard' && aiInsight && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-2xl p-6 shadow-xl flex gap-4">
             <div className="p-3 bg-indigo-600 rounded-xl h-fit">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Physique AI Insight</h3>
                <p className="text-white font-medium italic">{aiInsight}</p>
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
