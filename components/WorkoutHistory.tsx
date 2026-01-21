import React from 'react';
import { useWorkouts } from '../lib/hooks/useWorkouts';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';

export default function WorkoutHistory() {
  const { workouts, loading, error, deleteWorkout } = useWorkouts();

  const handleDelete = async (workoutId: string) => {
    if (confirm('Are you sure you want to delete this workout? This action cannot be undone.')) {
      await deleteWorkout(workoutId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Workout History</h2>

      {workouts.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-gray-400">No workouts logged yet. Go to the "Log Workout" tab to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workouts.map((workout) => (
            <div key={workout.id} className="bg-gray-800 border border-gray-700 rounded-lg p-5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-white">{workout.workout_name}</h3>
                  <p className="text-sm text-gray-400">{formatDate(workout.completed_at)}</p>
                </div>
                <button
                  onClick={() => handleDelete(workout.id)}
                  className="text-red-500 hover:text-red-400 text-sm font-semibold"
                >
                  Delete
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-3 text-sm">
                <span className="bg-indigo-900 text-indigo-300 px-2 py-1 rounded-full text-xs font-medium">
                  {workout.workout_type}
                </span>
                {workout.duration_minutes && (
                  <span className="text-gray-400">
                    ⏱️ {workout.duration_minutes} min
                  </span>
                )}
                {workout.calories_burned && (
                  <span className="text-gray-400">
                    🔥 {workout.calories_burned} cal
                  </span>
                )}
              </div>

              {workout.notes && (
                <p className="text-gray-300 text-sm mb-3 italic">"{workout.notes}"</p>
              )}

              {workout.exercises && workout.exercises.length > 0 && (
                <div className="mt-4 border-t border-gray-700 pt-3">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Exercises:</h4>
                  <div className="space-y-2">
                    {workout.exercises.sort((a,b) => a.order_index - b.order_index).map((exercise) => (
                      <div key={exercise.id} className="flex justify-between text-sm bg-gray-700/50 p-2 rounded">
                        <span className="font-medium">{exercise.exercise_name}</span>
                        <span className="text-gray-400">
                          {exercise.sets && exercise.reps && `${exercise.sets} × ${exercise.reps}`}
                          {exercise.weight && ` @ ${exercise.weight} lbs`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}