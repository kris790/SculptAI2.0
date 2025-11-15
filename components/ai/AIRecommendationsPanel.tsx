'use client';

import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { SparklesIcon } from '../icons';

interface Recommendation {
  recommendation_type: string;
  recommendation_text: string;
  confidence: number;
}

const AIRecommendationsPanel: React.FC = () => {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendation = async () => {
      setLoading(true);
      setError(null);
      try {
        // Corrected to use GET as defined in the API route
        const response = await fetch('/api/ai/recommendations');
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to get recommendation.');
        }
        const data = await response.json();
        setRecommendation(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendation();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-24">
          <LoadingSpinner size="md" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-400">
          <p>Could not load AI insight:</p>
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    if (recommendation) {
      return (
        <div>
          <p className="text-gray-300">{recommendation.recommendation_text}</p>
          <p className="text-xs text-gray-500 mt-3 text-right">Confidence: {(recommendation.confidence * 100).toFixed(0)}%</p>
        </div>
      );
    }

    return <p className="text-center text-gray-400">No recommendations available at this time.</p>;
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <SparklesIcon className="w-6 h-6 mr-3 text-indigo-400" />
        AI Training Insight
      </h3>
      {renderContent()}
    </div>
  );
};

export default AIRecommendationsPanel;