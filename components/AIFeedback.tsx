
import React from 'react';
import { SparklesIcon } from './icons';

interface AIFeedbackProps {
  content: string;
  type?: 'form' | 'motivation' | 'insight';
}

const AIFeedback: React.FC<AIFeedbackProps> = ({ content, type = 'insight' }) => {
  const titles = {
    form: 'AI Form Check',
    motivation: 'Coach Motivation',
    insight: 'Physique Insight'
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900/40 to-slate-800 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden group transition-all hover:shadow-indigo-500/10">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-lg">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">{titles[type]}</h4>
        </div>
        
        <p className="text-slate-200 text-lg font-medium leading-relaxed italic">
          "{content}"
        </p>
      </div>
    </div>
  );
};

export default AIFeedback;
