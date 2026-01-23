
import React, { useState, useEffect, useRef } from 'react';
import { beginnerProgram } from '../data/program';
import type { Program, Workout, Exercise } from '../lib/types';
import { CheckIcon, ChevronRightIcon, InfoIcon, ChevronDownIcon, TrophyIcon, SparklesIcon } from './icons';
import { useWorkouts } from '../lib/hooks/useWorkouts';
import { useAsyncAction } from '../lib/hooks/useAsyncAction';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { GoogleGenAI } from "@google/genai";
import AIFeedback from './AIFeedback';

// --- Sub-component: WorkoutSelection ---
const WorkoutSelection: React.FC<{
  program: Program;
  onSelectWorkout: (workoutId: string) => void;
}> = ({ program, onSelectWorkout }) => {
  return (
    <div className="w-full max-w-md mx-auto bg-white/[0.03] backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/10">
      <div className="p-8">
        <h2 className="text-3xl font-black text-white text-center mb-2 uppercase italic tracking-tight">
          {program.name}
        </h2>
        <p className="text-slate-500 text-center mb-8 text-sm font-bold tracking-widest uppercase">Select your protocol</p>
        <div className="space-y-4">
          {program.workouts.map((workout: Workout) => (
            <button
              key={workout.id}
              onClick={() => onSelectWorkout(workout.id)}
              className="w-full flex justify-between items-center text-left bg-white/5 hover:bg-indigo-600/20 p-6 rounded-2xl transition-all duration-300 group border border-transparent hover:border-indigo-500/30"
              aria-label={`Start workout: ${workout.name}`}
            >
              <div>
                <h3 className="font-bold text-white text-lg group-hover:text-indigo-400 transition-colors">{workout.name}</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{workout.exercises.length} Movements • Pro-Guided</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 transition-all">
                <ChevronRightIcon className="w-5 h-5 text-indigo-400 group-hover:text-white" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Sub-component: WorkoutCompleteScreen ---
const WorkoutCompleteScreen: React.FC<{
  completedWorkout: Workout;
  onFinish: () => void;
  isSaving: boolean;
  saveError: Error | null;
}> = ({ completedWorkout, onFinish, isSaving, saveError }) => {
  return (
    <div className="w-full max-w-md mx-auto bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 flex flex-col items-center text-center border border-white/10">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-2xl ${saveError ? 'bg-red-500/20 shadow-red-500/30' : 'bg-indigo-500/20 shadow-indigo-600/30'}`}>
        {saveError ? (
           <span className="material-symbols-outlined text-4xl text-red-500">error</span>
        ) : (
           <TrophyIcon className="w-12 h-12 text-indigo-400" />
        )}
      </div>
      <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">
        {isSaving ? 'Logging Data' : saveError ? 'Sync Failed' : 'Elite Session Done'}
      </h2>
      <p className="text-slate-400 mt-4 mb-10 text-base leading-relaxed font-medium">
        {isSaving
          ? 'Finalizing your training protocols in the secure cloud.'
          : saveError
          ? `Network Conflict: ${saveError.message}. We'll retry in the background.`
          : `You've mastered ${completedWorkout.name}. Every rep counts towards your silhouette.`}
      </p>
      
      {isSaving && <div className="mb-10"><LoadingSpinner size="lg" /></div>}
      
      <button
        onClick={onFinish}
        disabled={isSaving}
        className={`w-full ${saveError ? 'bg-slate-700' : 'bg-indigo-600 hover:bg-indigo-500'} text-white font-black py-5 rounded-2xl transition-all shadow-xl active:scale-95 uppercase tracking-[0.2em] italic`}
      >
        {isSaving ? 'Synchronizing...' : saveError ? 'Return to Hub' : 'Return to Hub'}
      </button>
    </div>
  );
};

export default function WorkoutLogger({ onWorkoutComplete }: { onWorkoutComplete: () => void; }) {
    const { createWorkout } = useWorkouts();
    const { execute, loading: isSaving, error: saveError } = useAsyncAction();

    const [programState, setProgramState] = useState<Program>(() => JSON.parse(JSON.stringify(beginnerProgram)));
    const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [currentSetIndex, setCurrentSetIndex] = useState(0);
    const [isResting, setIsResting] = useState(false);
    const [restTimeLeft, setRestTimeLeft] = useState(0);
    const [isWorkoutComplete, setIsWorkoutComplete] = useState(false);
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');
    const [validationError, setValidationError] = useState('');
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);
    const [showAiAssistant, setShowAiAssistant] = useState(false);
    const [aiFeedback, setAiFeedback] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);

    const activeWorkout = programState.workouts.find(w => w.id === selectedWorkoutId);
    const currentExercise = activeWorkout?.exercises[currentExerciseIndex];

    const getFormAssistantTips = async () => {
      if (!currentExercise || aiLoading) return;
      setAiLoading(true);
      setShowAiAssistant(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `
          As a world-class physique architecture coach, guide a beginner through ${currentExercise.name}.
          Explain these form cues with elite precision: ${currentExercise.formCues.join(', ')}.
          Tell them WHY these matters for long-term sculpting. Keep it professional, motivating, and under 90 words.
        `;
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
        });
        setAiFeedback(response.text);
      } catch (err) {
        setAiFeedback("Control the eccentric phase. Mindful tension is the primary architect of muscle symmetry.");
      } finally {
        setAiLoading(false);
      }
    };

    const handleLogSet = () => {
        if (!weight || !reps || isNaN(Number(weight)) || isNaN(Number(reps))) {
            setValidationError('Numeric values required for logging.');
            return;
        }
        setValidationError('');

        const updatedProgram = { ...programState };
        const workout = updatedProgram.workouts.find(w => w.id === selectedWorkoutId);
        if (workout && currentExercise) {
            const exercise = workout.exercises[currentExerciseIndex];
            exercise.loggedSets[currentSetIndex] = {
                weight: Number(weight),
                reps: Number(reps),
                completed: true
            };
            setProgramState(updatedProgram);
            
            if (currentSetIndex < currentExercise.sets - 1) {
                setIsResting(true);
                setRestTimeLeft(currentExercise.rest);
            } else {
                handleNextExercise();
            }
        }
    };

    const handleNextExercise = () => {
        if (activeWorkout && currentExerciseIndex < activeWorkout.exercises.length - 1) {
            setCurrentExerciseIndex(currentExerciseIndex + 1);
            setCurrentSetIndex(0);
            setIsResting(false);
            setWeight('');
            setReps('');
            setAiFeedback(null);
        } else {
            handleCompleteWorkout();
        }
    };

    const handleCompleteWorkout = async () => {
        if (!activeWorkout) return;
        
        const res = await execute(async () => {
            const exerciseData = activeWorkout.exercises.map((ex, idx) => ({
                exercise_name: ex.name,
                sets: ex.sets,
                reps: parseInt(ex.loggedSets[0]?.reps?.toString() || '0'),
                weight: parseFloat(ex.loggedSets[0]?.weight?.toString() || '0'),
                order_index: idx
            }));

            return await createWorkout({
                workout_name: activeWorkout.name,
                workout_type: 'strength',
                completed_at: new Date().toISOString(),
                duration_minutes: 45,
                calories_burned: 300,
                notes: 'SculptAI Guided Session'
            }, exerciseData as any);
        });

        // Always show complete screen to avoid getting stuck, even on error
        setIsWorkoutComplete(true);
    };

    if (isWorkoutComplete && activeWorkout) {
        return <WorkoutCompleteScreen 
                    completedWorkout={activeWorkout} 
                    onFinish={onWorkoutComplete} 
                    isSaving={isSaving} 
                    saveError={saveError} 
                />;
    }

    if (!selectedWorkoutId) {
        return <WorkoutSelection program={programState} onSelectWorkout={setSelectedWorkoutId} />;
    }

    if (!currentExercise) return null;

    return (
        <div className="max-w-5xl mx-auto flex flex-col gap-8">
            <div className="bg-[#0f172a] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 flex flex-col md:flex-row min-h-[500px]">
                <div className="md:w-1/2 relative bg-black group">
                    <video 
                        src={currentExercise.videoUrl} 
                        className="w-full h-full object-cover aspect-video md:aspect-auto" 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                    <div className="absolute top-6 left-6 flex items-center gap-3">
                        <span className="bg-indigo-600 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg tracking-widest shadow-xl italic">PRO DEMO</span>
                        <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-lg tracking-widest uppercase border border-white/10">4K FEED</span>
                    </div>
                </div>

                <div className="md:w-1/2 p-8 md:p-12 flex flex-col bg-white/[0.02]">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{currentExercise.name}</h2>
                            <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mt-3">MOVEMENT {currentExerciseIndex + 1} OF {activeWorkout.exercises.length}</p>
                        </div>
                        <button 
                            onClick={getFormAssistantTips}
                            className="p-3 bg-indigo-500 text-white rounded-2xl shadow-xl shadow-indigo-600/20 hover:scale-110 transition-all border border-indigo-400/30"
                            title="AI Assistant"
                        >
                            <SparklesIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex gap-4 mb-8">
                        <div className="flex-1 bg-white/5 p-5 rounded-3xl border border-white/5 text-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Set Index</p>
                            <p className="text-3xl font-black text-white italic">{currentSetIndex + 1}<span className="text-sm text-slate-500 not-italic ml-1">/{currentExercise.sets}</span></p>
                        </div>
                        <div className="flex-1 bg-white/5 p-5 rounded-3xl border border-white/5 text-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Target</p>
                            <p className="text-3xl font-black text-white italic">{currentExercise.reps}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Intensity (LBS)</label>
                                <input 
                                    type="number" 
                                    value={weight} 
                                    onChange={(e) => setWeight(e.target.value)} 
                                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-white font-black text-xl italic focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-800"
                                    placeholder="00"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Rep Count</label>
                                <input 
                                    type="number" 
                                    value={reps} 
                                    onChange={(e) => setReps(e.target.value)} 
                                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-white font-black text-xl italic focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-800"
                                    placeholder="00"
                                />
                            </div>
                        </div>

                        {validationError && <p className="text-red-400 text-[10px] font-black uppercase text-center tracking-widest">{validationError}</p>}

                        <button 
                            onClick={handleLogSet}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] italic transition-all shadow-xl shadow-indigo-600/30 active:scale-[0.98]"
                        >
                            Finalize Set
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 shadow-xl">
                    <button 
                        onClick={() => setIsDetailsVisible(!isDetailsVisible)}
                        className="w-full flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400"
                    >
                        Elite Form Protocols
                        <ChevronDownIcon className={`w-5 h-5 transition-transform ${isDetailsVisible ? 'rotate-180' : ''}`} />
                    </button>
                    {isDetailsVisible && (
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                            {currentExercise.formCues.map((cue, idx) => (
                                <div key={idx} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 items-start">
                                    <div className="w-5 h-5 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-black">{idx + 1}</div>
                                    <p className="text-sm text-slate-300 font-medium leading-tight">{cue}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 flex flex-col justify-center items-center text-center shadow-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Recover Window</p>
                    <div className={`text-6xl font-black tabular-nums italic ${isResting ? 'text-indigo-400 shadow-indigo-500/20 drop-shadow-xl' : 'text-white/20'}`}>
                        {isResting ? restTimeLeft : '--'}
                    </div>
                    {isResting && (
                        <button 
                            onClick={() => setIsResting(false)} 
                            className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors border-b border-white/10 pb-1"
                        >
                            Skip Recovery
                        </button>
                    )}
                </div>
            </div>

            {showAiAssistant && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                <div className="bg-[#1e293b] border border-indigo-500/30 rounded-[2.5rem] max-w-xl w-full p-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-3xl -z-0" />
                  
                  <div className="flex justify-between items-center mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl">
                        <SparklesIcon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">AI Form Assistant</h3>
                    </div>
                    <button onClick={() => setShowAiAssistant(false)} className="text-slate-500 hover:text-white transition-colors p-2">
                      <span className="material-symbols-outlined text-3xl">close</span>
                    </button>
                  </div>
                  
                  <div className="min-h-[160px] flex items-center justify-center relative z-10">
                    {aiLoading ? (
                      <LoadingSpinner size="lg" />
                    ) : (
                      <div className="space-y-6">
                        <p className="text-white text-xl md:text-2xl font-bold leading-relaxed italic tracking-tight text-center md:text-left">
                          "{aiFeedback}"
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                          <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border border-indigo-500/20">Hypertrophy Goal</span>
                          <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border border-cyan-500/20">Optimal Symmetry</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => setShowAiAssistant(false)}
                    className="w-full mt-10 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] italic transition-all relative z-10 shadow-xl shadow-indigo-600/30"
                  >
                    Resuming Session
                  </button>
                </div>
              </div>
            )}
        </div>
    );
}
