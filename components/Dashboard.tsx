import React from 'react';
import { useWorkouts } from '../lib/hooks/useWorkouts';
import { useProgressLogs } from '../lib/hooks/useProgressLogs';
import { LoadingSpinner } from './ui/LoadingSpinner';
import AIRecommendationsPanel from './ai/AIRecommendationsPanel';
import ProgressDashboard from './analytics/ProgressDashboard';

export default function Dashboard() {
  const { workouts, loading: workoutsLoading } = useWorkouts();
  const { logs, loading: logsLoading } = useProgressLogs();

  if (workoutsLoading || logsLoading) return <div className="flex justify-center items-center p-8"><LoadingSpinner /></div>;

  const totalWorkouts = workouts.length;
  const thisWeekWorkouts = workouts.filter(w => {
    const workoutDate = new Date(w.completed_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return workoutDate >= weekAgo;
  }).length;

  const totalMinutes = workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
  
  // Calculate V-Taper Ratio from latest log
  const latestLog = logs.length > 0 ? logs[0] : null;
  const currentRatio = latestLog && latestLog.shoulders && latestLog.waist 
    ? (latestLog.shoulders / latestLog.waist).toFixed(2)
    : 'N/A';

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">Physique Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-lg p-6 shadow-lg">
          <p className="text-indigo-100 text-sm mb-1">V-Taper Ratio</p>
          <p className="text-4xl font-bold">{currentRatio}</p>
          <p className="text-xs text-indigo-200 mt-2 font-medium">Target: 1.50 (Golden Ratio)</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
          <p className="text-green-100 text-sm mb-1">Workouts Logged</p>
          <p className="text-4xl font-bold">{totalWorkouts}</p>
          <p className="text-xs text-green-200 mt-2">{thisWeekWorkouts} completed this week</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
          <p className="text-purple-100 text-sm mb-1">Training Volume</p>
          <p className="text-4xl font-bold">{totalMinutes}</p>
          <p className="text-xs text-purple-200 mt-2">Total active minutes</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-6 shadow-lg">
          <p className="text-red-100 text-sm mb-1">Latest Weight</p>
          <p className="text-4xl font-bold">{latestLog?.weight || '--'} <span className="text-lg">lbs</span></p>
          <p className="text-xs text-red-200 mt-2">{latestLog ? new Date(latestLog.log_date).toLocaleDateString() : 'No data yet'}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content: AI Panel and Progress Chart */}
        <div className="lg:col-span-2 space-y-6">
          <AIRecommendationsPanel />
          <ProgressDashboard />
        </div>

        {/* Sidebar: Recent Activity */}
        <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4">Recent Training</h3>
           {workouts.slice(0, 5).length === 0 ? (
            <p className="text-gray-400 text-center py-8">No workouts yet</p>
          ) : (
            <div className="space-y-3">
              {workouts.slice(0, 5).map((workout) => (
                <div key={workout.id} className="border-l-4 border-indigo-500 pl-4 py-2 bg-gray-700/50 rounded-r-md">
                  <p className="font-semibold">{workout.workout_name}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(workout.completed_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}