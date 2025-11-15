import type { Database } from './database.types';

export type CoachWithListings = Database['public']['Tables']['coaches']['Row'] & {
  coach_listings: Database['public']['Tables']['coach_listings']['Row'][]
};

// Fix: Add types for workout programs, which were missing or in a non-module file.
export interface LoggedSet {
  weight: number | null;
  reps: number | null;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  videoUrl: string;
  sets: number;
  reps: string;
  rest: number;
  formCues: string[];
  loggedSets: LoggedSet[];
}

export interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
}

export interface Program {
  id: string;
  name: string;
  workouts: Workout[];
}
