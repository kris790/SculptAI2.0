import React, { useEffect } from 'react';
import { useChallenges } from '../lib/hooks/useChallenges';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';

const CommunityChallenges: React.FC = () => {
  const { challenges, loading, error, fetchChallenges, joinChallenge } = useChallenges();

  useEffect(() => {
    fetchChallenges();
  }, []);

  if (loading) return <div className="flex justify-center py-8"><LoadingSpinner /></div>;
  if (error) return <ErrorMessage error={error} />;
  
  const getProgressPercentage = (challenge: any) => {
    // Fix: Add Array.isArray check to safely handle cases where the join fails.
    if (!Array.isArray(challenge.user_challenge_participation) || !challenge.user_challenge_participation?.[0]) return 0;
    return Math.min(100, Math.round((challenge.user_challenge_participation[0].current_progress / challenge.target_value) * 100));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Community Challenges</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.length > 0 ? (
          challenges.map((challenge) => {
            // Fix: Add Array.isArray check to safely handle cases where the join fails.
            const participation = Array.isArray(challenge.user_challenge_participation) ? challenge.user_challenge_participation[0] : undefined;
            const isJoined = !!participation;
            const isCompleted = isJoined && participation.completed;
            const progressPercentage = getProgressPercentage(challenge);
            
            return (
              <div key={challenge.id} className="border border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-medium">{challenge.title}</h3>
                  {isCompleted && <span className="px-2 py-1 bg-green-900 text-green-300 text-xs font-medium rounded-full">Completed</span>}
                </div>
                <p className="text-gray-400 mb-4 text-sm">{challenge.description}</p>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1 text-gray-400">
                    <span>Target: {challenge.target_value} {challenge.challenge_type?.replace('_', ' ')}</span>
                    <span>{isJoined ? `${participation.current_progress} / ${challenge.target_value}` : ''}</span>
                  </div>
                  {isJoined && (
                    <div className="w-full bg-gray-600 rounded-full h-2.5">
                      <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                  )}
                </div>
                {!isJoined ? (
                  <button onClick={() => joinChallenge(challenge.id)} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    Join Challenge
                  </button>
                ) : (
                  <p className="text-center text-sm text-green-400">You've joined this challenge!</p>
                )}
              </div>
            );
          })
        ) : (
          <p className="col-span-full text-center py-8 text-gray-400">No active challenges right now. Check back soon!</p>
        )}
      </div>
    </div>
  );
};

export default CommunityChallenges;