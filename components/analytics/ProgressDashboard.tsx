'use client';

import React from 'react';
import { useProgressLogs } from '@/lib/hooks/useProgressLogs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LoadingSpinner } from '../ui/LoadingSpinner';

const ProgressDashboard: React.FC = () => {
  const { logs, loading } = useProgressLogs();

  const chartData = logs
    .filter(log => log.weight)
    .map(log => ({
      date: new Date(log.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
      weight: log.weight,
    }))
    .reverse(); // reverse to show oldest to newest

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
      <h3 className="text-xl font-bold mb-6">Weight Progression (kg)</h3>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : chartData.length > 1 ? (
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  borderColor: '#4B5563',
                  color: '#D1D5DB'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="weight" stroke="#818CF8" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-center text-gray-400 h-64 flex items-center justify-center">
          Log at least two weight entries to see your progress chart.
        </p>
      )}
    </div>
  );
};

export default ProgressDashboard;