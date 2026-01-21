
import React from 'react';

interface GoalCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  isSelected: boolean;
  onSelect: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ title, description, icon, isSelected, onSelect }) => {
  return (
    <button
      onClick={onSelect}
      className={`p-6 rounded-[2rem] border text-left transition-all group relative overflow-hidden h-full flex flex-col justify-between ${
        isSelected
          ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_40px_rgba(79,70,229,0.3)]'
          : 'bg-white/5 border-white/10 hover:border-white/20'
      }`}
    >
      <div className="absolute -top-2 -right-2 p-4 opacity-5 text-7xl select-none group-hover:scale-110 group-hover:opacity-10 transition-all">
        {icon}
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl drop-shadow-md">{icon}</span>
          <h3 className="font-black text-white uppercase italic text-sm tracking-tight">{title}</h3>
        </div>
        <p className={`text-[11px] leading-relaxed font-medium ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
          {description}
        </p>
      </div>
    </button>
  );
};
