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

export function useWorkouts() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchWorkouts = useCallback(async () => {
    if (!user) {
      setWorkouts([]);
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

      setWorkouts(workoutsData as unknown as WorkoutWithExercises[])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch workouts'))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
        fetchWorkouts();
    } else {
        setLoading(false);
        setWorkouts([]);
    }
  }, [user, fetchWorkouts])

  const createWorkout = async (workoutData: Omit<WorkoutInsert, 'id' | 'user_id' | 'created_at'>, exercises: Omit<ExerciseInsert, 'id' | 'workout_id' | 'created_at'>[]) => {
    if (!user) throw new Error('User not authenticated')

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
    const { error } = await supabase
      .from('workouts')
      .update(updates)
      .eq('id', workoutId)

    if (error) throw error
    await fetchWorkouts()
  }

  const deleteWorkout = async (workoutId: string) => {
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