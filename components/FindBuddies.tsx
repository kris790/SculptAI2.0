import React, { useState, useEffect } from 'react';
import { useBuddies } from '../lib/hooks/useBuddies';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';

const FindBuddies: React.FC = () => {
  const {
    potentialBuddies,
    loading,
    error,
    searchUsers,
    sendBuddyRequest,
  } = useBuddies();
  const [filters, setFilters] = useState({ location: '', fitness_goal: '' });

  useEffect(() => {
    // Initial search with empty filters
    searchUsers(filters);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchUsers(filters);
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Find a Workout Buddy</h2>
      
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Location (e.g., City)"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          className="p-2 bg-gray-700 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
        <input
          type="text"
          placeholder="Fitness Goal (e.g., Strength)"
          value={filters.fitness_goal}
          onChange={(e) => setFilters({ ...filters, fitness_goal: e.target.value })}
          className="p-2 bg-gray-700 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          Search
        </button>
      </form>
      
      {error && <ErrorMessage error={error} />}
      
      {loading ? (
        <div className="flex justify-center py-8"><LoadingSpinner /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {potentialBuddies.length > 0 ? (
            potentialBuddies.map((buddy) => (
              <div key={buddy.id} className="border border-gray-700 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-gray-600 mr-3 flex items-center justify-center font-bold text-lg">
                    {buddy.username?.[0]?.toUpperCase() ?? 'A'}
                  </div>
                  <div>
                    <h3 className="font-semibold">{buddy.username}</h3>
                    <p className="text-sm text-gray-400">{buddy.location || 'N/A'}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-1">
                  <span className="font-medium text-gray-400">Goals:</span> {buddy.fitness_goals?.join(', ') || 'Not specified'}
                </p>
                <p className="text-sm text-gray-300 mb-3">
                  <span className="font-medium text-gray-400">Experience:</span> {buddy.experience_level || 'Not specified'}
                </p>
                <button
                  onClick={() => sendBuddyRequest(buddy.id)}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                >
                  Send Request
                </button>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center py-8 text-gray-400">
              No users found with these criteria. Try a broader search.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FindBuddies;
