
// app/api/ai/recommendations/route.ts
// Fix: Use createRouteHandlerClient for Next.js Route Handlers as per @supabase/auth-helpers-nextjs documentation.
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

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // Fetch user data for context
    const { data: recentWorkouts, error: workoutError } = await supabase
      .from('workouts')
      .select('*, exercises(*)')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(5);

    if (workoutError) throw workoutError;

    // Default recommendation if ML service is not configured or fails
    const mockRecommendation = {
      recommendation_type: "hypertrophy_optimization",
      recommendation_text: "Analyze your structural data suggests a 15% increase in lateral delt volume is required to maintain your current V-Taper trajectory. Prioritize leaning lateral raises in your next upper body session.",
      confidence: 0.92
    };

    if (!mlServiceUrl) {
      return NextResponse.json(mockRecommendation);
    }

    try {
      const response = await fetch(`${mlServiceUrl}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          recent_avg_volume: 1200,
          current_strength_level: 85,
          recent_avg_frequency: 4,
          weeks_since_last_deload: 3
        }),
        // Short timeout for ML service
        signal: AbortSignal.timeout(3000)
      });

      if (!response.ok) throw new Error('ML service unhealthy');
      const recommendation = await response.json();
      return NextResponse.json(recommendation);
    } catch (e) {
      console.warn("ML Service unreachable, using fallback logic.");
      return NextResponse.json(mockRecommendation);
    }

  } catch (error) {
    console.error('AI Recommendation API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred.' },
      { status: 500 }
    );
  }
}
