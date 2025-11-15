import React, { useState, useEffect, useRef } from 'react';
import { beginnerProgram } from '../data/program';
// Fix: Corrected import to point to `lib/types.ts` where the Program and Workout types are now defined.
import type { Program, Workout } from '../lib/types';
import { CheckIcon, ChevronRightIcon, InfoIcon, ChevronDownIcon, TrophyIcon } from './icons';
import { useWorkouts } from '../lib/hooks/useWorkouts';
import { useAsyncAction } from '../lib/hooks/useAsyncAction';
import { LoadingSpinner } from './ui/LoadingSpinner';

// --- Sub-component: WorkoutSelection ---
const WorkoutSelection: React.FC<{
  program: Program;
  onSelectWorkout: (workoutId: string) => void;
}> = ({ program, onSelectWorkout }) => {
  return (
    <div className="w-full max-w-md mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
      <div className="p-6 md:p-8">
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          {program.name}
        </h2>
        <p className="text-gray-400 text-center mb-6">Choose your workout for today.</p>
        <div className="space-y-4">
          {program.workouts.map((workout: Workout) => (
            <button
              key={workout.id}
              onClick={() => onSelectWorkout(workout.id)}
              className="w-full flex justify-between items-center text-left bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label={`Start workout: ${workout.name}`}
            >
              <div>
                <h3 className="font-semibold text-lg text-white">{workout.name}</h3>
                <p className="text-sm text-gray-400">{workout.exercises.length} Exercises</p>
              </div>
              <ChevronRightIcon className="w-6 h-6 text-gray-500" />
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
    <div className="w-full max-w-md mx-auto bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 flex flex-col items-center text-center animate-fade-in-up">
      <TrophyIcon className="w-16 h-16 text-yellow-400 mb-4" />
      <h2 className="text-3xl font-bold text-white">
        {isSaving ? 'Saving Workout...' : saveError ? 'Error Saving' : 'Workout Complete!'}
      </h2>
      <p className="text-gray-300 mt-2 mb-6">
        {isSaving
          ? 'Just a moment while we log your hard work.'
          : saveError
          ? `Could not save your workout: ${saveError.message}`
          : `Great job finishing ${completedWorkout.name}.`}
      </p>
      
      {isSaving && <div className="my-4"><LoadingSpinner /></div>}
      
      <button
        onClick={onFinish}
        disabled={isSaving}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
      >
        {isSaving ? 'Please Wait' : 'Finish & View History'}
      </button>
    </div>
  );
};

// --- Main Guided Workout Component ---
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
    const restAudioRef = useRef<HTMLAudioElement | null>(null);
    
    useEffect(() => {
        if (typeof Audio !== 'undefined') {
            restAudioRef.current = new Audio('data:audio/wav;base64,UklGRjIXAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YRIZAABAgD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/');
        }
    }, []);

    const currentWorkoutIndex = selectedWorkoutId ? programState.workouts.findIndex(w => w.id === selectedWorkoutId) : -1;
    const currentWorkout = currentWorkoutIndex !== -1 ? programState.workouts[currentWorkoutIndex] : null;
    const currentExercise = currentWorkout ? currentWorkout.exercises[currentExerciseIndex] : null;

    const isLastSetOfExercise = currentExercise ? currentSetIndex >= currentExercise.sets - 1 : false;
    const isLastExerciseOfWorkout = currentWorkout ? currentExerciseIndex >= currentWorkout.exercises.length - 1 : false;

    useEffect(() => {
        let timer: number | undefined;
        if (isResting && restTimeLeft > 0) {
            timer = window.setInterval(() => setRestTimeLeft(prev => prev - 1), 1000);
        } else if (isResting && restTimeLeft === 0) {
            setIsResting(false);
            restAudioRef.current?.play();
            if (!isLastSetOfExercise) {
                setCurrentSetIndex(prev => prev + 1);
            }
        }
        return () => clearInterval(timer);
    }, [isResting, restTimeLeft, isLastSetOfExercise]);
    
    const handleSaveWorkout = async (completedWorkout: Workout) => {
        await execute(async () => {
            const workoutData = {
                workout_name: completedWorkout.name,
                workout_type: 'strength', // Defaulting as this isn't in the static data
            };

            const exercisesData = completedWorkout.exercises
                .map((ex, index) => {
                    const completedSets = ex.loggedSets.filter(s => s.completed);
                    if (completedSets.length === 0) return null;

                    const totalSets = completedSets.length;
                    const avgReps = Math.round(completedSets.reduce((sum, s) => sum + (s.reps || 0), 0) / totalSets);
                    const avgWeight = parseFloat((completedSets.reduce((sum, s) => sum + (s.weight || 0), 0) / totalSets).toFixed(2));
                    
                    return {
                        exercise_name: ex.name,
                        sets: totalSets,
                        reps: avgReps,
                        weight: avgWeight,
                        order_index: index,
                    };
                })
                .filter((ex): ex is NonNullable<typeof ex> => ex !== null); 

            if (exercisesData.length > 0) {
                await createWorkout(workoutData, exercisesData);
            }
        });
    };

    const handleLogSet = () => {
        if (!currentWorkout || !currentExercise || currentWorkoutIndex === -1) return;

        const weightNum = parseFloat(weight);
        const repsNum = parseInt(reps, 10);

        if (weight.trim() === '' || reps.trim() === '') {
            setValidationError('Please fill in both weight and reps.');
            return;
        }
        if (isNaN(weightNum) || weightNum < 0) {
            setValidationError('Weight must be 0 or greater.');
            return;
        }
        if (isNaN(repsNum) || repsNum <= 0) {
            setValidationError('Reps must be a positive number.');
            return;
        }
        setValidationError('');

        const newProgramState = JSON.parse(JSON.stringify(programState));
        const exercise = newProgramState.workouts[currentWorkoutIndex].exercises[currentExerciseIndex];
        exercise.loggedSets[currentSetIndex] = { weight: weightNum, reps: repsNum, completed: true };
        setProgramState(newProgramState);

        const restDuration = exercise.rest;
        setRestTimeLeft(restDuration);
        setIsResting(true);
        setWeight('');
        setReps('');
    };
    
    const handleNextExercise = () => {
        if (isLastExerciseOfWorkout) {
            if (currentWorkout) {
                handleSaveWorkout(currentWorkout);
            }
            setIsWorkoutComplete(true);
        } else {
            setCurrentExerciseIndex(prev => prev + 1);
            setCurrentSetIndex(0);
            setIsDetailsVisible(false);
        }
    };

    const handleFinish = () => {
        // Reset local state for next workout
        setProgramState(JSON.parse(JSON.stringify(beginnerProgram)));
        setSelectedWorkoutId(null);
        setCurrentExerciseIndex(0);
        setCurrentSetIndex(0);
        setIsWorkoutComplete(false);
        // Navigate to history tab
        onWorkoutComplete();
    };

    if (!selectedWorkoutId) {
        return <WorkoutSelection program={programState} onSelectWorkout={setSelectedWorkoutId} />;
    }

    if (isWorkoutComplete) {
        return <WorkoutCompleteScreen 
            completedWorkout={currentWorkout!} 
            onFinish={handleFinish}
            isSaving={isSaving}
            saveError={saveError}
        />;
    }
    
    if (!currentWorkout || !currentExercise) {
        return <div className="text-center p-8">An unexpected error occurred. Please refresh.</div>;
    }
    
    return (
        <div className="w-full max-w-md mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden animate-fade-in-up relative">
            <div className="relative">
                <video
                    key={currentExercise.id}
                    className="w-full h-48 object-cover"
                    src={currentExercise.videoUrl}
                    autoPlay loop muted playsInline
                    aria-label={`${currentExercise.name} video demonstration`}
                />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-gray-800 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-sm uppercase tracking-wider text-indigo-400 font-semibold">{`Exercise ${currentExerciseIndex + 1} / ${currentWorkout.exercises.length}`}</p>
                    <h2 className="text-2xl font-bold">{currentExercise.name}</h2>
                </div>
            </div>

            <div className="p-4 md:p-6">
                 <div className="grid grid-cols-3 gap-4 text-center mb-6">
                    <div>
                        <p className="text-gray-400 text-sm">Sets</p>
                        <p className="text-white font-bold text-lg">{currentExercise.sets}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Reps</p>
                        <p className="text-white font-bold text-lg">{currentExercise.reps}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Rest</p>
                        <p className="text-white font-bold text-lg">{currentExercise.rest}s</p>
                    </div>
                </div>

                <div className="space-y-2 mb-4">
                    {currentExercise.loggedSets.map((set, index) => (
                        <div key={index} className={`flex justify-between items-center p-3 rounded-lg transition-colors duration-200 ${currentSetIndex === index && !isResting ? 'bg-gray-700' : 'bg-transparent'}`}>
                            <div className="flex items-center space-x-3">
                                {set.completed ? (
                                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0" aria-label="Set completed"><CheckIcon className="w-4 h-4 text-white" /></div>
                                ) : (
                                    <div className={`w-6 h-6 rounded-full border-2 ${currentSetIndex === index ? 'border-indigo-400' : 'border-gray-600'} flex items-center justify-center flex-shrink-0`} aria-label={`Set ${index + 1}`}>
                                        <span className={`text-xs font-bold ${currentSetIndex === index ? 'text-indigo-400' : 'text-gray-500'}`}>{index + 1}</span>
                                    </div>
                                )}
                                <p className={`font-semibold ${set.completed ? 'text-gray-500 line-through' : 'text-white'}`}>Target: {currentExercise.reps} reps</p>
                            </div>
                            {set.completed && <p className="text-sm text-gray-300">{set.weight}lbs &times; {set.reps} reps</p>}
                        </div>
                    ))}
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg mb-4">
                     <h3 className="font-semibold text-white mb-2">Log Set {currentSetIndex + 1}</h3>
                    <div className="flex space-x-2">
                        <input type="number" placeholder="Weight (lbs)" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-1/2 p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label="Weight input" disabled={isResting} />
                        <input type="number" placeholder="Reps" value={reps} onChange={(e) => setReps(e.target.value)} className="w-1/2 p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label="Reps input" disabled={isResting} />
                    </div>
                     {validationError && <p className="text-red-400 text-xs mt-2">{validationError}</p>}
                </div>

                <button onClick={handleLogSet} disabled={isResting} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center">
                    <CheckIcon className="w-5 h-5 mr-2" /> Log Set
                </button>

                <div className="border-b border-gray-700 mt-4">
                    <button onClick={() => setIsDetailsVisible(!isDetailsVisible)} className="w-full flex justify-between items-center py-3 text-left text-gray-300 hover:text-white transition-colors" aria-expanded={isDetailsVisible}>
                        <div className="flex items-center"><InfoIcon className="w-5 h-5 mr-3 text-gray-500" /><span className="font-semibold">View Form Cues & Details</span></div>
                        <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isDetailsVisible ? 'rotate-180' : ''}`} />
                    </button>
                    {isDetailsVisible && (
                        <div className="pt-2 pb-4 px-4 animate-fade-in">
                            <h4 className="font-semibold text-indigo-400 mb-2">Key Form Cues</h4>
                            <ul className="space-y-2 list-disc list-inside text-gray-400 text-sm pl-2">{currentExercise.formCues.map((cue, index) => <li key={index}>{cue}</li>)}</ul>
                        </div>
                    )}
                </div>

                {isLastSetOfExercise && currentExercise.loggedSets[currentSetIndex].completed && (
                    <button onClick={handleNextExercise} className="w-full mt-4 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center animate-fade-in">
                        {isLastExerciseOfWorkout ? 'Finish Workout' : 'Next Exercise'}
                        <ChevronRightIcon className="w-5 h-5 ml-2" />
                    </button>
                )}
            </div>
            
            {isResting && (
                <div className="absolute inset-0 bg-gray-900 bg-opacity-95 flex flex-col items-center justify-center animate-fade-in z-10">
                    <p className="text-2xl text-gray-400 mb-2">Rest</p>
                    <p className="text-7xl font-bold text-white mb-6 tabular-nums">{restTimeLeft}</p>
                    <p className="text-gray-300 mb-6 text-center px-4">Next up: <span className="font-bold text-white">{isLastSetOfExercise ? currentWorkout.exercises[currentExerciseIndex + 1]?.name || 'Workout Complete' : `${currentExercise.name} - Set ${currentSetIndex + 2}`}</span></p>
                    <button onClick={() => { setIsResting(false); if (!isLastSetOfExercise) { setCurrentSetIndex(prev => prev + 1); }}} className="text-indigo-400 hover:text-indigo-300 font-semibold">Skip Rest</button>
                </div>
            )}
        </div>
    );
}