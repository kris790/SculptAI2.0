// app/api/ai/recommendations/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/lib/database.types'

type WorkoutWithExercises = Database['public']['Tables']['workouts']['Row'] & {
  exercises: Database['public']['Tables']['exercises']['Row'][] | null
}

export async function GET() {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const mlServiceUrl = process.env.ML_SERVICE_URL;

  if (!mlServiceUrl) {
    return new NextResponse(
      JSON.stringify({ error: 'ML service URL is not configured.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const userId = session.user.id;

    const { data, error: workoutError } = await supabase
      .from('workouts')
      .select('*, exercises(*)')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(10);
      
    const recentWorkouts = data as WorkoutWithExercises[] | null;
      
    if (workoutError) throw new Error(`Supabase error: ${workoutError.message}`);

    let recent_avg_volume = 1000;
    let current_strength_level = 100;

    if (recentWorkouts && recentWorkouts.length > 0) {
      const totalVolume = recentWorkouts.reduce((acc, workout) => {
        return acc + (workout.exercises?.reduce((exAcc: number, ex: any) => {
            return exAcc + ((ex.sets || 0) * (ex.reps || 0) * (ex.weight || 0));
        }, 0) || 0);
      }, 0);
      recent_avg_volume = totalVolume / recentWorkouts.length;

      const latestWorkout = recentWorkouts[0];
      current_strength_level = latestWorkout.exercises?.reduce((exAcc: number, ex: any) => {
        return exAcc + ((ex.sets || 0) * (ex.reps || 0) * (ex.weight || 0));
      }, 0) || 100;
    }
    
    const features = {
        user_id: userId,
        recent_avg_volume,
        current_strength_level,
        recent_avg_frequency: 3.5, 
        weeks_since_last_deload: 4, 
    };

    const response = await fetch(`${mlServiceUrl}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(features),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("ML Service Error:", errorBody);
        throw new Error(`ML service failed with status ${response.status}`);
    }

    const recommendation = await response.json();
    return NextResponse.json(recommendation);

  } catch (error) {
    console.error('AI Recommendation API Error:', error);
    return new NextResponse(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}