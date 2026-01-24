
import { DummyUser } from './generators';

export interface GeneratedProgram {
  name: string;
  goal: string;
  focus: string;
  schedule: string[];
  workouts: string[]; // To simulate progress steps
  macroTargets: { protein: number; carbs: number; fats: number; calories: number };
}

export interface AIRecommendation {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  actionSteps: string[];
  type: 'form' | 'nutrition' | 'recovery';
}

export const MockAIService = {
  generateProgram: (user: DummyUser): GeneratedProgram => {
    return {
      name: `${user.goal.replace('_', ' ').toUpperCase()} ELITE PROTOCOL`,
      goal: user.goal.replace('_', ' ').toUpperCase(),
      focus: user.goal === 'build_muscle' ? 'Hypertrophy & Width' : 'Fat Loss & Density',
      schedule: ['Mon: Push (Shoulder Focus)', 'Tue: Pull (Width Focus)', 'Wed: Rest/Mobility', 'Thu: Legs', 'Fri: Upper Body Symmetry', 'Sat: Active Recovery', 'Sun: Rest'],
      workouts: Array.from({ length: 6 }), // Simulates 6 weeks completed
      macroTargets: {
        protein: Math.round(1.2 * user.measurements[user.measurements.length - 1].weight),
        carbs: 250,
        fats: 75,
        calories: 2600,
      }
    };
  },

  generateRecommendations: (user: DummyUser): AIRecommendation[] => {
    const latest = user.measurements[user.measurements.length - 1];
    const recommendations: AIRecommendation[] = [
      {
        id: 'rec-1',
        type: 'form',
        priority: 'high',
        title: 'Shoulder-to-Waist Ratio Improvement',
        description: `Your current ratio is ${latest.calculatedRatio}. To reach your target of ${user.targetRatio}, prioritize lateral delt isolation.`,
        actionSteps: [
          'Increase lateral raise volume by 20% over the next 3 weeks',
          'Add 1 extra set of Face Pulls to your Pull days',
          'Focus on full-range controlled eccentrics'
        ]
      },
      {
        id: 'rec-2',
        type: 'nutrition',
        priority: 'medium',
        title: 'Protein Consistency',
        description: 'Your protein intake fluctuated by 15% last week. Aim for a tighter margin for muscle synthesis.',
        actionSteps: [
          'Pre-log your meals in the morning',
          'Target 30-40g of protein per meal',
          'Increase water intake to 120oz minimum'
        ]
      },
      {
        id: 'rec-3',
        type: 'recovery',
        priority: 'low',
        title: 'Fatigue Accumulation',
        description: 'Analysis of your previous recovery cycles suggests a deload is optimal after session #6.',
        actionSteps: [
          'Reduce intensity to 70% next week',
          'Focus on mobility for 15 mins daily',
          'Ensure 8+ hours of sleep'
        ]
      }
    ];
    return recommendations;
  },

  analyzePose: async (imageUrl: string) => {
    // Artificial delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      score: 85,
      feedback: "Great lat spread. Try tilting your pelvis slightly forward to decrease waist appearance and emphasize the V-taper.",
      segments: {
        shoulders: 'Excellent width',
        waist: 'Tight, but could be tighter',
        quads: 'Improve sweep'
      }
    };
  }
};
