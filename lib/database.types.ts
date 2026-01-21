export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          age: number | null
          height: number | null
          weight: number | null
          gender: string | null
          fitness_goal: string | null
          unit_preference: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          age?: number | null
          height?: number | null
          weight?: number | null
          gender?: string | null
          fitness_goal?: string | null
          unit_preference?: string | null
        }
        Update: {
          full_name?: string | null
          age?: number | null
          height?: number | null
          weight?: number | null
          gender?: string | null
          fitness_goal?: string | null
          unit_preference?: string | null
        }
        Relationships: []
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          workout_name: string
          workout_type: string
          duration_minutes: number | null
          calories_burned: number | null
          notes: string | null
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workout_name: string
          workout_type: string
          duration_minutes?: number | null
          calories_burned?: number | null
          notes?: string | null
          completed_at?: string
        }
        Update: {
          workout_name?: string
          workout_type?: string
          duration_minutes?: number | null
          calories_burned?: number | null
          notes?: string | null
          completed_at?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          id: string
          workout_id: string
          exercise_name: string
          sets: number | null
          reps: number | null
          weight: number | null
          duration_seconds: number | null
          distance: number | null
          notes: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          workout_id: string
          exercise_name: string
          sets?: number | null
          reps?: number | null
          weight?: number | null
          duration_seconds?: number | null
          distance?: number | null
          notes?: string | null
          order_index: number
        }
        Update: {
          exercise_name?: string
          sets?: number | null
          reps?: number | null
          weight?: number | null
          duration_seconds?: number | null
          distance?: number | null
          notes?: string | null
          order_index?: number
        }
        Relationships: []
      }
      progress_logs: {
        Row: {
          id: string
          user_id: string
          log_date: string
          weight: number | null
          shoulders: number | null
          body_fat_percentage: number | null
          muscle_mass: number | null
          chest: number | null
          waist: number | null
          hips: number | null
          arms: number | null
          thighs: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          log_date: string
          weight?: number | null
          shoulders?: number | null
          body_fat_percentage?: number | null
          muscle_mass?: number | null
          chest?: number | null
          waist?: number | null
          hips?: number | null
          arms?: number | null
          thighs?: number | null
          notes?: string | null
        }
        Update: {
          log_date?: string
          weight?: number | null
          shoulders?: number | null
          body_fat_percentage?: number | null
          muscle_mass?: number | null
          chest?: number | null
          waist?: number | null
          hips?: number | null
          arms?: number | null
          thighs?: number | null
          notes?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          username: string | null
          bio: string | null
          avatar_url: string | null
          location: string | null
          fitness_goals: string[] | null
          experience_level: string | null
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          bio?: string | null
        }
        Update: {
          username?: string | null
          bio?: string | null
          location?: string | null
          fitness_goals?: string[] | null
          experience_level?: string | null
          is_visible?: boolean
        }
        Relationships: []
      }
      buddy_connections: {
        Row: {
          id: string
          requester_id: string
          addressee_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          requester_id: string
          addressee_id: string
        }
        Update: {
          status?: string
        }
        Relationships: []
      }
      athlete_spotlights: {
        Row: {
          id: string
          user_id: string
          title: string | null
          content: string | null
          image_url: string | null
          featured: boolean
          likes_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          title: string
          content: string
        }
        Update: {
          title?: string
          content?: string
        }
        Relationships: []
      }
      community_challenges: {
        Row: {
          id: string
          title: string | null
          description: string | null
          challenge_type: string | null
          target_value: number | null
          start_date: string | null
          end_date: string | null
          created_at: string
        }
        Insert: {}
        Update: {}
        Relationships: []
      }
      user_challenge_participation: {
        Row: {
          id: string
          user_id: string
          challenge_id: string
          current_progress: number
          completed: boolean
          joined_at: string
        }
        Insert: {
          user_id: string
          challenge_id: string
        }
        Update: {
          current_progress?: number
          completed?: boolean
        }
        Relationships: []
      }
      spotlight_likes: {
        Row: {
          id: string
          user_id: string
          spotlight_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          spotlight_id: string
        }
        Update: {}
        Relationships: []
      }
      coaches: {
        Row: {
          id: string
          user_id: string
          business_name: string | null
          bio: string | null
          certifications: Json | null
          specialties: string[] | null
          coaching_style: string | null
          profile_image_url: string | null
          is_verified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
        }
        Update: {
          id?: string
        }
        Relationships: []
      }
      coach_listings: {
        Row: {
          id: string
          coach_id: string
          title: string | null
          description: string | null
          price_cents: number | null
          currency: string | null
          duration_weeks: number | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          coach_id: string
        }
        Update: {
          id?: string
        }
        Relationships: []
      }
      coach_bookings: {
        Row: {
          id: string
          user_id: string
          coach_id: string
          listing_id: string
          status: string | null
          stripe_payment_intent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          coach_id: string
          listing_id: string
        }
        Update: {
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}