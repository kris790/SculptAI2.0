
import React, { useState } from 'react';
import CoachProfile from './CoachProfile';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { useCoaches } from '../lib/hooks/useCoaches';
import type { CoachWithListings } from '../lib/types';

const CoachMarketplace: React.FC = () => {
  const { coaches, loading, error } = useCoaches();
  const [selectedCoach, setSelectedCoach] = useState<CoachWithListings | null>(null);

  if (selectedCoach) {
    return <CoachProfile coach={selectedCoach} onBack={() => setSelectedCoach(null)} />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">Pro Network</h2>
        <p className="text-slate-400 text-sm">Connect with verified sculpting specialists for personalized protocols.</p>
      </div>
      
      {loading && <div className="flex justify-center py-12"><LoadingSpinner /></div>}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl text-center">
          <p className="text-red-400 font-bold mb-2">Network Error</p>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      )}
      
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coaches.length > 0 ? coaches.map((coach) => (
            <div 
              key={coach.id} 
              onClick={() => setSelectedCoach(coach)} 
              className="bg-slate-800/50 rounded-2xl shadow-xl overflow-hidden border border-slate-700 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer group flex flex-col"
            >
              <div className="h-48 bg-slate-900 relative">
                {coach.profile_image_url ? (
                  <img src={coach.profile_image_url} alt={coach.business_name || 'Coach'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-500/10">
                    <span className="text-4xl">🏆</span>
                  </div>
                )}
                <div className="absolute bottom-4 left-4">
                  <span className="bg-indigo-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded tracking-widest shadow-xl">Verified Pro</span>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-black text-white mb-2 uppercase italic">{coach.business_name}</h3>
                <p className="text-sm text-slate-400 mb-4 line-clamp-2 leading-relaxed">{coach.bio}</p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {coach.specialties?.slice(0, 3).map((spec, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-700/50 text-indigo-300 text-[10px] font-black uppercase tracking-widest rounded border border-indigo-500/20">{spec}</span>
                  ))}
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center bg-slate-800/30 rounded-3xl border border-dashed border-slate-700">
               <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No specialists currently active in your region.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CoachMarketplace;
