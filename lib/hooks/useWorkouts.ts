import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../../components/AuthProvider'
import type { Database } from '../database.types'

type Workout = Database['public']['Tables']['workouts']['Row']
type Exercise = Database['public']['Tables']['exercises']['Row']
type WorkoutInsert = Database['public']['Tables']['workouts']['Insert']
type ExerciseInsert = Database['public']['Tables']['exercises']['Insert']
type WorkoutUpdate = Database['public']['Tables']['workouts']['Update']

export interface WorkoutWithExercises extends Workout {
  exercises: Exercise[]
}

const DUMMY_WORKOUTS: WorkoutWithExercises[] = [
  {
    id: 'dummy-1',
    user_id: 'guest',
    workout_name: 'Upper Body Power',
    workout_type: 'strength',
    duration_minutes: 65,
    calories_burned: 420,
    notes: 'Feeling strong today. Increased weight on bench press.',
    completed_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date().toISOString(),
    exercises: [
      { id: 'ex-1', workout_id: 'dummy-1', exercise_name: 'Dumbbell Bench Press', sets: 4, reps: 10, weight: 70, duration_seconds: null, distance: null, notes: null, order_index: 0, created_at: '' },
      { id: 'ex-2', workout_id: 'dummy-1', exercise_name: 'Seated Cable Row', sets: 4, reps: 12, weight: 145, duration_seconds: null, distance: null, notes: null, order_index: 1, created_at: '' },
    ]
  },
  {
    id: 'dummy-2',
    user_id: 'guest',
    workout_name: 'V-Taper Lat Focus',
    workout_type: 'strength',
    duration_minutes: 50,
    calories_burned: 310,
    notes: 'Mind-muscle connection was on point.',
    completed_at: new Date(Date.now() - 172800000).toISOString(),
    created_at: new Date().toISOString(),
    exercises: [
      { id: 'ex-3', workout_id: 'dummy-2', exercise_name: 'Wide Grip Lat Pull Down', sets: 4, reps: 12, weight: 120, duration_seconds: null, distance: null, notes: null, order_index: 0, created_at: '' },
    ]
  }
];

export function useWorkouts() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>(DUMMY_WORKOUTS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchWorkouts = useCallback(async () => {
    if (!user) {
      setWorkouts(DUMMY_WORKOUTS);
      setLoading(false);
      return;
    }

    setLoading(true)
    setError(null)

    try {
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workouts')
        .select(`
          *,
          exercises (*)
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })

      if (workoutsError) throw workoutsError

      const finalData = (workoutsData as any).length > 0 
        ? (workoutsData as unknown as WorkoutWithExercises[]) 
        : DUMMY_WORKOUTS;
        
      setWorkouts(finalData)
    } catch (err) {
      setWorkouts(DUMMY_WORKOUTS); // Fallback on error
      setError(err instanceof Error ? err : new Error('Failed to fetch workouts'))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchWorkouts();
  }, [user, fetchWorkouts])

  const createWorkout = async (workoutData: Omit<WorkoutInsert, 'id' | 'user_id' | 'created_at'>, exercises: Omit<ExerciseInsert, 'id' | 'workout_id' | 'created_at'>[]) => {
    if (!user) {
      // Logic for dummy local storage or state update could go here
      const newWorkout: WorkoutWithExercises = {
        id: Math.random().toString(),
        user_id: 'guest',
        workout_name: workoutData.workout_name,
        workout_type: workoutData.workout_type,
        completed_at: workoutData.completed_at || new Date().toISOString(),
        duration_minutes: workoutData.duration_minutes || 0,
        calories_burned: workoutData.calories_burned || 0,
        notes: workoutData.notes || '',
        created_at: new Date().toISOString(),
        exercises: exercises.map((e, i) => ({ ...e, id: Math.random().toString(), workout_id: 'dummy', order_index: i, created_at: '' } as Exercise))
      };
      setWorkouts(prev => [newWorkout, ...prev]);
      return newWorkout;
    }

    const workoutToInsert: WorkoutInsert = {
      ...workoutData,
      user_id: user.id,
      completed_at: workoutData.completed_at || new Date().toISOString(),
      duration_minutes: workoutData.duration_minutes ?? null,
      calories_burned: workoutData.calories_burned ?? null,
      notes: workoutData.notes ?? null,
    };
    
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert(workoutToInsert)
      .select()
      .single()

    if (workoutError) throw workoutError
    if (!workout) throw new Error('Workout creation failed.')

    if (exercises.length > 0) {
      const exercisesWithWorkoutId: ExerciseInsert[] = exercises.map(ex => ({
        ...ex,
        workout_id: workout.id,
        sets: ex.sets ?? null,
        reps: ex.reps ?? null,
        weight: ex.weight ?? null,
        duration_seconds: ex.duration_seconds ?? null,
        distance: ex.distance ?? null,
        notes: ex.notes ?? null,
      }))

      const { error: exercisesError } = await supabase
        .from('exercises')
        .insert(exercisesWithWorkoutId)

      if (exercisesError) throw exercisesError
    }

    await fetchWorkouts()
    return workout
  }

  const updateWorkout = async (workoutId: string, updates: WorkoutUpdate) => {
    if (!user) return;
    const { error } = await supabase
      .from('workouts')
      .update(updates)
      .eq('id', workoutId)

    if (error) throw error
    await fetchWorkouts()
  }

  const deleteWorkout = async (workoutId: string) => {
    if (!user) {
      setWorkouts(prev => prev.filter(w => w.id !== workoutId));
      return;
    }
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId)

    if (error) throw error
    await fetchWorkouts()
  }

  return {
    workouts,
    loading,
    error,
    fetchWorkouts,
    createWorkout,
    updateWorkout,
    deleteWorkout
  }
}