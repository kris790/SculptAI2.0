// components/CoachProfile.tsx
'use client';

import React from 'react';
import type { CoachWithListings } from '@/lib/types';

interface CoachProfileProps {
  coach: CoachWithListings;
  onBack: () => void;
}

const CoachProfile: React.FC<CoachProfileProps> = ({ coach, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onBack} className="mb-6 text-indigo-400 hover:text-indigo-300 font-semibold">
        &larr; Back to Marketplace
      </button>

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
        <div className="p-6 md:p-8">
          <div className="md:flex md:items-start md:space-x-8">
            <div className="md:w-1/3 text-center md:text-left mb-6 md:mb-0">
              <div className="w-40 h-40 rounded-full bg-gray-700 mx-auto mb-4">
                {coach.profile_image_url && <img src={coach.profile_image_url} alt={coach.business_name || 'Coach'} className="w-full h-full object-cover rounded-full" />}
              </div>
              <h2 className="text-2xl font-bold text-white">{coach.business_name}</h2>
            </div>
            <div className="md:w-2/3">
              <h3 className="text-lg font-semibold text-indigo-400 mb-2">About</h3>
              <p className="text-gray-300 mb-6">{coach.bio}</p>
              
              <h3 className="text-lg font-semibold text-indigo-400 mb-2">Specialties</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {coach.specialties?.map((spec, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-700 text-gray-300 text-sm font-medium rounded-full">{spec}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 p-6 md:p-8 border-t border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6">Coaching Services</h3>
          <div className="space-y-4">
            {coach.coach_listings.length > 0 ? (
              coach.coach_listings.map((listing) => (
                <div key={listing.id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-white">{listing.title}</h4>
                    <p className="text-sm text-gray-400">{listing.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-indigo-400">
                      ${(listing.price_cents / 100).toFixed(2)}
                    </p>
                    <button className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700">
                      Book Now
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center">This coach has not listed any services yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachProfile;