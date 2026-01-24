
import React, { useMemo } from 'react';

interface SymmetryVisualizerProps {
  shoulders: number;
  waist: number;
  gender?: string;
}

export const SymmetryVisualizer: React.FC<SymmetryVisualizerProps> = ({ shoulders, waist, gender = 'male' }) => {
  const ratio = useMemo(() => (shoulders / waist) || 1.2, [shoulders, waist]);
  
  // Normalize values for SVG viewport (e.g. 100x150)
  // Baseline: waist at 40px wide, shoulders calculated from ratio
  const waistWidth = 44;
  const shoulderWidth = waistWidth * ratio;
  
  // Constrain for display
  const displayShoulders = Math.min(85, Math.max(50, shoulderWidth));
  const displayWaist = waistWidth;
  
  const centerX = 50;
  const topY = 20;
  const bottomY = 130;
  const midY = 65;

  return (
    <div className="relative w-full aspect-[3/4] bg-slate-950/50 rounded-3xl border border-white/5 flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent)]" />
      
      <svg viewBox="0 0 100 150" className="w-full h-full drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
        <defs>
          <linearGradient id="silhouetteGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Guideline Ratios */}
        <line x1="10" y1={topY} x2="90" y2={topY} stroke="white" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.1" />
        <line x1="10" y1={midY} x2="90" y2={midY} stroke="white" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.1" />

        {/* The "Sculpt" Silhouette - Simplified Aesthetic Torso */}
        <path
          d={`
            M ${centerX - displayShoulders/2} ${topY}
            C ${centerX - displayShoulders/2} ${topY + 20}, ${centerX - displayWaist/2} ${midY - 10}, ${centerX - displayWaist/2} ${midY}
            L ${centerX - displayWaist/2 + 5} ${bottomY}
            L ${centerX + displayWaist/2 - 5} ${bottomY}
            L ${centerX + displayWaist/2} ${midY}
            C ${centerX + displayWaist/2} ${midY - 10}, ${centerX + displayShoulders/2} ${topY + 20}, ${centerX + displayShoulders/2} ${topY}
            Z
          `}
          fill="url(#silhouetteGrad)"
          fillOpacity="0.8"
          stroke="#818cf8"
          strokeWidth="1.5"
          className="transition-all duration-1000 ease-out"
        />

        {/* Anatomical Accents */}
        <path
          d={`M ${centerX - displayShoulders/2 + 5} ${topY + 15} Q ${centerX} ${topY + 25} ${centerX + displayShoulders/2 - 5} ${topY + 15}`}
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          opacity="0.3"
        />
        
        <circle cx={centerX} cy={topY - 10} r="8" fill="#1e293b" stroke="#818cf8" strokeWidth="1" />
      </svg>

      <div className="absolute bottom-6 left-0 w-full text-center">
        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Silhouette Scan</p>
        <div className="flex justify-center items-baseline gap-1">
          <span className="text-2xl font-black text-white italic">{ratio.toFixed(2)}</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Index</span>
        </div>
      </div>
    </div>
  );
};
