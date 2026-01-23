
// app/api/user/measurements/route.ts
// Fix: Use createRouteHandlerClient for Next.js Route Handlers as per @supabase/auth-helpers-nextjs documentation.
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/lib/database.types'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Log the structural scan in progress_logs
    const { data, error } = await supabase
      .from('progress_logs')
      .insert({
        user_id: session.user.id,
        log_date: new Date().toISOString().split('T')[0],
        weight: parseFloat(body.weight),
        shoulders: parseFloat(body.shoulders),
        waist: parseFloat(body.waist),
        chest: body.chest ? parseFloat(body.chest) : null,
        arms: body.arms ? parseFloat(body.arms) : null,
        body_fat_percentage: body.bodyFat ? parseFloat(body.bodyFat) : null,
        notes: `Manual log from Measurements Hub. Experience: ${body.trainingExperience}.`
      })
      .select()
      .single();

    if (error) throw error;

    // Update the base profile goals if provided
    if (body.trainingExperience) {
       await supabase.from('user_profiles').update({
         experience_level: body.trainingExperience.charAt(0).toUpperCase() + body.trainingExperience.slice(1)
       }).eq('id', session.user.id);
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Measurement Log Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save architectural data' },
      { status: 500 }
    );
  }
}
