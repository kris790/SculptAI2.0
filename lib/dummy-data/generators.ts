
import { faker } from '@faker-js/faker';

export interface DummyUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  goal: 'lose_weight' | 'build_muscle' | 'body_recomp' | 'competition_prep';
  targetRatio: number;
  timelineWeeks: number;
  measurements: Array<{
    id: string;
    date: string;
    shoulders: number;
    waist: number;
    weight: number;
    calculatedRatio: number;
  }>;
  workouts: Array<{
    id: string;
    date: string;
    type: string;
    duration: number;
    volume: number;
    exercises: string[];
  }>;
  nutritionLogs: Array<{
    id: string;
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    waterOz: number;
  }>;
}

export const generateDummyUser = (): DummyUser => {
  const goal = faker.helpers.arrayElement(['lose_weight', 'build_muscle', 'body_recomp', 'competition_prep'] as const);
  
  // Generate 12 weeks of historical measurements
  const measurements = Array.from({ length: 12 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (11 - i) * 7);
    
    // Gradual improvement logic
    const shoulderStart = 48 + faker.number.float({ min: -1, max: 1 });
    const shoulderEnd = 52 + faker.number.float({ min: -1, max: 1 });
    const shoulders = shoulderStart + (shoulderEnd - shoulderStart) * (i / 11);
    
    const waistStart = 34 + faker.number.float({ min: -0.5, max: 0.5 });
    const waistEnd = 31 + faker.number.float({ min: -0.5, max: 0.5 });
    const waist = waistStart + (waistEnd - waistStart) * (i / 11);
    
    const weightStart = 195;
    const weightEnd = 182;
    const weight = weightStart + (weightEnd - weightStart) * (i / 11) + faker.number.float({ min: -1, max: 1 });

    return {
      id: faker.string.uuid(),
      date: date.toISOString(),
      shoulders: parseFloat(shoulders.toFixed(1)),
      waist: parseFloat(waist.toFixed(1)),
      weight: parseFloat(weight.toFixed(1)),
      calculatedRatio: parseFloat((shoulders / waist).toFixed(2)),
    };
  });

  // Generate 30 recent workouts
  const workouts = Array.from({ length: 30 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    // 4-5 workouts per week
    if (faker.number.int({ min: 1, max: 7 }) > 5) return null;

    return {
      id: faker.string.uuid(),
      date: date.toISOString(),
      type: faker.helpers.arrayElement(['Push', 'Pull', 'Legs', 'Full Body', 'Symmetry Refinement']),
      duration: faker.number.int({ min: 45, max: 90 }),
      volume: faker.number.int({ min: 3000, max: 8000 }),
      exercises: faker.helpers.arrayElements([
        'Lateral Raises', 'Pull-ups', 'Face Pulls', 'Barbell Row', 'OHP', 'Arnold Press', 'Bench Press', 'Squat', 'RDL'
      ], 5),
    };
  }).filter(Boolean) as DummyUser['workouts'];

  // Generate 30 nutrition logs
  const nutritionLogs = Array.from({ length: 30 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return {
      id: faker.string.uuid(),
      date: date.toISOString(),
      calories: faker.number.int({ min: 2200, max: 2800 }),
      protein: faker.number.int({ min: 160, max: 210 }),
      carbs: faker.number.int({ min: 200, max: 300 }),
      fats: faker.number.int({ min: 60, max: 90 }),
      waterOz: faker.number.int({ min: 80, max: 140 }),
    };
  });

  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    goal,
    targetRatio: 1.61,
    timelineWeeks: 12,
    measurements,
    workouts,
    nutritionLogs,
  };
};
