
'use client';

import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { SparklesIcon } from '../icons';
import { GoogleGenAI } from "@google/genai";
import { useAuth } from '../AuthProvider';

interface Recommendation {
  recommendation_type: string;
  recommendation_text: string;
  confidence: number;
}

const AIRecommendationsPanel: React.FC = () => {
  const { user, profile } = useAuth();
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateRecommendation = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `
          You are SculptAI, a world-class physique architecture coach. 
          Provide a specific, highly technical coaching recommendation for an athlete.
          User Profile:
          - Goal: ${profile?.fitness_goal || 'physique development'}
          - Age: ${profile?.age || 'N/A'}
          - Weight: ${profile?.weight || 'N/A'} lbs
          
          Generate a JSON response with the following keys:
          - recommendation_type: a slug like "hypertrophy_optimization" or "structural_refinement"
          - recommendation_text: a professional 1-2 sentence tip focusing on V-Taper, frame width, or symmetry.
          - confidence: a float between 0.8 and 0.99
          
          Respond ONLY with the JSON.
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });

        const data = JSON.parse(response.text || '{}');
        setRecommendation({
          recommendation_type: data.recommendation_type || "structural_refinement",
          recommendation_text: data.recommendation_text || "Prioritize lateral delt volume to enhance frame width.",
          confidence: data.confidence || 0.95
        });
      } catch (err) {
        console.error("Recommendation generation error:", err);
        setError("AI Engine recalibrating. Using structural default.");
        setRecommendation({
          recommendation_type: "system_default",
          recommendation_text: "Ensure progressive overload on primary compound movements this week. Target a 2.5% intensity increase.",
          confidence: 0.85
        });
      } finally {
        setLoading(false);
      }
    };

    generateRecommendation();
  }, [user, profile]);

  return (
    <div className="bg-slate-900 border border-indigo-500/20 rounded-[2rem] p-8 shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-3xl -z-0" />
      
      <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
        <SparklesIcon className="w-5 h-5 text-indigo-400" />
        AI Architecture Insight
      </h3>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      ) : (
        <div className="relative z-10 animate-fade-in">
          {error && (
            <div className="mb-4 text-[9px] font-black text-amber-500/70 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {error}
            </div>
          )}
          
          <p className="text-slate-300 font-medium leading-relaxed italic text-lg">
            "{recommendation?.recommendation_text}"
          </p>
          
          <div className="mt-6 flex justify-between items-center">
             <div className="flex gap-2">
                <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[8px] font-black uppercase tracking-widest rounded border border-indigo-500/20">
                  {recommendation?.recommendation_type.replace(/_/g, ' ')}
                </span>
             </div>
             <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                Confidence: {Math.round((recommendation?.confidence || 0) * 100)}%
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIRecommendationsPanel;
