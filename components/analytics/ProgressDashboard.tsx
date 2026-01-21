'use client';

import React from 'react';
import { useProgressLogs } from '@/lib/hooks/useProgressLogs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LoadingSpinner } from '../ui/LoadingSpinner';

const ProgressDashboard: React.FC = () => {
  const { logs, loading } = useProgressLogs();

  const weightData = logs
    .filter(log => log.weight)
    .map(log => ({
      date: new Date(log.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
      weight: log.weight,
    }))
    .reverse();

  const ratioData = logs
    .filter(log => log.shoulders && log.waist)
    .map(log => ({
      date: new Date(log.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
      ratio: Number((log.shoulders! / log.waist!).toFixed(2)),
    }))
    .reverse();

  return (
    <div className="space-y-6">
      {/* Weight Chart */}
      <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
        <h3 className="text-xl font-bold mb-6">Weight Progression (lbs)</h3>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : weightData.length > 1 ? (
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <LineChart
                data={weightData}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    borderColor: '#4B5563',
                    color: '#D1D5DB'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="weight" name="Body Weight" stroke="#818CF8" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-center text-gray-400 h-64 flex items-center justify-center">
            Log at least two entries with weight to see progression.
          </p>
        )}
      </div>

      {/* V-Taper Ratio Chart */}
      <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
        <h3 className="text-xl font-bold mb-6 text-indigo-400">V-Taper (Shoulder:Waist) Ratio</h3>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : ratioData.length > 1 ? (
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <LineChart
                data={ratioData}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} domain={[1.0, 1.8]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    borderColor: '#4B5563',
                    color: '#D1D5DB'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="ratio" name="V-Taper Ratio" stroke="#4F46E5" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-center text-gray-400 h-64 flex items-center justify-center">
            Log shoulder and waist measurements to track your V-taper progression.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProgressDashboard;