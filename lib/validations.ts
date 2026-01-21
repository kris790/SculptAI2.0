
import { z } from 'zod'

export const emailSchema = z.string().email('Invalid email address')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const profileSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  age: z.number().int().min(18, 'Must be at least 18 years old').max(120, 'Invalid age'),
  height: z.number().positive('Height must be positive').max(300, 'Invalid height'),
  weight: z.number().positive('Weight must be positive').max(500, 'Invalid weight'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  fitness_goal: z.enum(['lose_weight', 'build_muscle', 'body_recomp', 'competition_prep', 'maintain', 'improve_fitness']).optional(),
  unit_preference: z.enum(['metric', 'imperial']).default('imperial')
})

export const userProfileSchema = z.object({
    username: z.string()
      .min(3, 'Username must be at least 3 characters')
      .max(15, 'Username cannot be more than 15 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    bio: z.string().max(10000).optional(),
    location: z.string().max(100).optional(),
    fitness_goals: z.array(z.string()).optional(),
    experience_level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Elite']).optional(),
    is_visible: z.boolean().default(true),
});

export const measurementSchema = z.object({
  height: z.number().min(48, 'Minimum height is 48"').max(96, 'Maximum height is 96"'),
  weight: z.number().min(80, 'Minimum weight is 80lbs').max(500, 'Maximum weight is 500lbs'),
  age: z.number().min(18, 'Must be at least 18').max(100, 'Maximum age is 100'),
  gender: z.enum(['male', 'female', 'other']),
  shoulders: z.number().min(20, 'Shoulder width too small').max(80, 'Shoulder width too large'),
  waist: z.number().min(15, 'Waist too small').max(70, 'Waist too large'),
  chest: z.number().min(20).max(70).optional(),
  arms: z.number().min(5).max(30).optional(),
  bodyFat: z.number().min(3).max(60).optional(),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very-active']),
  trainingExperience: z.enum(['beginner', 'intermediate', 'advanced', 'elite']),
});

export const workoutSchema = z.object({
  workout_name: z.string().min(1, 'Workout name is required').max(100),
  workout_type: z.enum(['strength', 'cardio', 'flexibility', 'sports', 'other']),
  duration_minutes: z.number().positive().optional(),
  calories_burned: z.number().positive().optional(),
  notes: z.string().max(500).optional(),
  completed_at: z.string().optional()
})

export const exerciseSchema = z.object({
  exercise_name: z.string().min(1, 'Exercise name is required').max(100),
  sets: z.number().int().positive().optional(),
  reps: z.number().int().positive().optional(),
  weight: z.number().positive().optional(),
  duration_seconds: z.number().int().positive().optional(),
  distance: z.number().positive().optional(),
  notes: z.string().max(300).optional(),
  order_index: z.number().int().min(0)
})

export const progressLogSchema = z.object({
  log_date: z.string(),
  weight: z.number().positive().optional(),
  shoulders: z.number().positive('Shoulder measurement is required'),
  body_fat_percentage: z.number().min(3).max(60).optional(),
  chest: z.number().positive().optional(),
  waist: z.number().positive('Waist measurement is required'),
  arms: z.number().positive().optional(),
  thighs: z.number().positive().optional(),
  calves: z.number().positive().optional(),
  notes: z.string().max(500).optional()
})

export type ProfileFormData = z.infer<typeof profileSchema>
export type UserProfileFormData = z.infer<typeof userProfileSchema>
export type WorkoutFormData = z.infer<typeof workoutSchema>
export type ExerciseFormData = z.infer<typeof exerciseSchema>
export type ProgressLogFormData = z.infer<typeof progressLogSchema>
export type MeasurementFormData = z.infer<typeof measurementSchema>;
