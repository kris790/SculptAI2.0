// components/CoachMarketplace.tsx
'use client';

import React, { useState, useEffect } from 'react';
import CoachProfile from './CoachProfile';
import { LoadingSpinner } from './ui/LoadingSpinner';
import type { CoachWithListings } from '@/lib/types';

const CoachMarketplace: React.FC = () => {
  const [coaches, setCoaches] = useState<CoachWithListings[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<CoachWithListings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoaches = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/coaches');
        if (!response.ok) {
          throw new Error('Failed to fetch coaches.');
        }
        const data = await response.json();
        setCoaches(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchCoaches();
  }, []);

  if (selectedCoach) {
    return <CoachProfile coach={selectedCoach} onBack={() => setSelectedCoach(null)} />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">Coach Marketplace</h2>
      
      {loading && <div className="flex justify-center py-12"><LoadingSpinner /></div>}
      {error && <p className="text-center text-red-400">{error}</p>}
      
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coaches.map((coach) => (
            <div key={coach.id} onClick={() => setSelectedCoach(coach)} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 hover:border-indigo-500 transition-all duration-300 cursor-pointer group">
              <div className="h-48 bg-gray-700">
                {coach.profile_image_url && <img src={coach.profile_image_url} alt={coach.business_name || 'Coach'} className="w-full h-full object-cover" />}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{coach.business_name}</h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{coach.bio}</p>
                <div className="flex flex-wrap gap-2">
                  {coach.specialties?.slice(0, 3).map((spec, i) => (
                    <span key={i} className="px-2 py-1 bg-indigo-900 text-indigo-300 text-xs font-medium rounded-full">{spec}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoachMarketplace;