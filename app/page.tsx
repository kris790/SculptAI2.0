'use client';

import React, { useState } from 'react';
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

export default function Home() {
  const { user, signOut, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'log' | 'history' | 'progress' | 'community' | 'coaches' | 'profile'>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-4">
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
             <h1 className="text-3xl font-bold text-white tracking-tight">
              Sculpt<span className="text-indigo-400">AI</span>
            </h1>
            <button
              onClick={signOut}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto">
          <div className="flex space-x-4 sm:space-x-8">
            {[
              { id: 'dashboard', label: '📊 Dashboard' },
              { id: 'log', label: '✍️ Log Workout' },
              { id: 'history', label: '📋 History' },
              { id: 'progress', label: '📈 Progress' },
              { id: 'community', label: '👥 Community' },
              { id: 'coaches', label: '🏆 Coaches' },
              { id: 'profile', label: '👤 Profile' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 sm:px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-400 text-indigo-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

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