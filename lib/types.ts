
import type { Database } from './database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type ProgressLog = Database['public']['Tables']['progress_logs']['Row'];
export type WorkoutRecord = Database['public']['Tables']['workouts']['Row'];
export type ExerciseRecord = Database['public']['Tables']['exercises']['Row'];

export type CoachWithListings = Database['public']['Tables']['coaches']['Row'] & {
  coach_listings: Database['public']['Tables']['coach_listings']['Row'][]
};

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

export interface SymmetryData {
  shoulders: number;
  waist: number;
  ratio: number;
  date: string;
}
