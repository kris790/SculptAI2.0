// app/api/coaches/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/lib/database.types'
import type { CoachWithListings } from '@/lib/types';

export async function GET() {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  try {
    const { data: coaches, error } = await supabase
      .from('coaches')
      .select(`
        *,
        coach_listings (*)
      `)
      .eq('is_verified', true)

    if (error) {
      console.error('Error fetching coaches:', error);
      throw new Error(error.message);
    }

    return NextResponse.json(coaches as CoachWithListings[]);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}