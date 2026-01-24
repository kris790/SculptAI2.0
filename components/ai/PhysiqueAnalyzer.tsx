import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
// Fix: Corrected import to pull SparklesIcon from the icons component and LoadingSpinner from the ui/LoadingSpinner component.
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { SparklesIcon } from '../icons';

export const PhysiqueAnalyzer: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzePhysique = async () => {
    if (!image || loading) return;
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = image.split(',')[1];
      
      const prompt = `
        You are SculptAI, a world-class physique architecture expert. 
        Analyze this beginner physique photo.
        Focus on:
        1. Proportional balance (Upper vs Lower).
        2. Foundation development areas (Delts, Back, Core).
        3. Provide 3 specific, motivating, and foundational "Sculpting" tips for a beginner.
        Keep the feedback professional, encouraging, and under 150 words.
        Speak directly to the user.
      `;

      // Fix: Strictly follow Google GenAI SDK guidelines for sending multi-part content (text and image) using the object format.
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
          ]
        },
      });

      setAnalysis(response.text || "Your foundation looks solid. Focus on upper back thickness to improve your silhouette's width.");
    } catch (err) {
      console.error("Analysis Error:", err);
      setAnalysis("AI Analysis failed. Ensure the photo is clear and shows your full upper body for the best results.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/40 border border-indigo-500/30 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3 flex flex-col gap-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-[3/4] bg-slate-900 rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/50 transition-all overflow-hidden relative group"
          >
            {image ? (
              <>
                <img src={image} className="w-full h-full object-cover" alt="Upload" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                  <span className="text-white font-bold uppercase text-xs tracking-widest">Change Photo</span>
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <span className="material-symbols-outlined text-slate-500 text-4xl mb-2">add_a_photo</span>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Tap to Upload <br/> Physique Photo</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
          </div>
          
          <button
            onClick={analyzePhysique}
            disabled={!image || loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-black py-4 rounded-xl uppercase tracking-widest italic transition-all shadow-lg shadow-indigo-600/20"
          >
            {loading ? <LoadingSpinner size="sm" /> : "Run AI Analysis"}
          </button>
        </div>

        <div className="md:w-2/3 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Physique Feedback</h3>
          </div>

          <div className="flex-1 bg-slate-900/50 rounded-2xl p-6 border border-slate-700 relative min-h-[200px]">
            {analysis ? (
              <div className="space-y-4 animate-fade-in">
                <p className="text-slate-200 text-base leading-relaxed whitespace-pre-line italic">
                  "{analysis}"
                </p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
                  Upload a photo to receive <br/> personalized sculpting advice.
                </p>
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-500 mt-4 uppercase tracking-widest text-right">
            Confidential analysis by SculptAI Core v4.0
          </p>
        </div>
      </div>
    </div>
  );
};