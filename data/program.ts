// Fix: Corrected import to point to `lib/types.ts` where the Program type is now defined.
import type { Program } from '../lib/types';

export const beginnerProgram: Program = {
  id: 'prog_beginner_1',
  name: 'Strength Training Foundations',
  workouts: [
    {
      id: 'workout_fb_1',
      name: 'Full Body Foundations A',
      exercises: [
        {
          id: 'ex_goblet_squat',
          name: 'Goblet Squat',
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-squats-with-a-kettlebell-49272-large.mp4',
          sets: 3,
          reps: '8-12',
          rest: 90,
          formCues: [
            'Keep chest up and back straight.',
            'Hold the dumbbell close to your chest.',
            'Squat down until thighs are parallel to the floor.',
            'Push through your heels to stand back up.',
          ],
          loggedSets: [
            { weight: null, reps: null, completed: false },
            { weight: null, reps: null, completed: false },
            { weight: null, reps: null, completed: false },
          ],
        },
        {
          id: 'ex_db_bench_press',
          name: 'Dumbbell Bench Press',
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-lifting-weights-in-a-gym-42778-large.mp4',
          sets: 3,
          reps: '8-12',
          rest: 90,
          formCues: [
            'Lie flat on the bench with feet firm on the ground.',
            'Lower the dumbbells to your chest with control.',
            'Keep your elbows at a 45-degree angle.',
            'Press the dumbbells up until arms are fully extended.',
          ],
          loggedSets: [
            { weight: null, reps: null, completed: false },
            { weight: null, reps: null, completed: false },
            { weight: null, reps: null, completed: false },
          ],
        },
        {
          id: 'ex_bent_over_row',
          name: 'Bent-Over Row',
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-exercising-with-a-barbell-in-a-gym-42780-large.mp4',
          sets: 3,
          reps: '8-12',
          rest: 90,
          formCues: [
            'Hinge at your hips, keeping your back straight.',
            'Pull the barbell towards your lower chest.',
            'Squeeze your shoulder blades together at the top.',
            'Lower the weight with control.',
          ],
          loggedSets: [
            { weight: null, reps: null, completed: false },
            { weight: null, reps: null, completed: false },
            { weight: null, reps: null, completed: false },
          ],
        },
      ],
    },
    {
      id: 'workout_fb_2',
      name: 'Full Body Foundations B',
      exercises: [
        {
          id: 'ex_db_rdl',
          name: 'Dumbbell Romanian Deadlift',
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-does-romanian-deadlift-with-dumbbells-49275-large.mp4',
          sets: 3,
          reps: '8-12',
          rest: 90,
          formCues: [
            'Keep your back straight and chest up.',
            'Hinge at your hips, pushing them back.',
            'Lower the dumbbells until you feel a stretch in your hamstrings.',
            'Squeeze your glutes to return to the starting position.',
          ],
          loggedSets: [
            { weight: null, reps: null, completed: false },
            { weight: null, reps: null, completed: false },
            { weight: null, reps: null, completed: false },
          ],
        },
        {
          id: 'ex_db_ohp',
          name: 'Dumbbell Overhead Press',
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-shoulder-press-with-dumbbells-42788-large.mp4',
          sets: 3,
          reps: '8-12',
          rest: 90,
          formCues: [
            'Sit or stand with a straight back.',
            'Press the dumbbells straight up overhead.',
            "Don't arch your lower back excessively.",
            'Lower the weights with control.',
          ],
          loggedSets: [
            { weight: null, reps: null, completed: false },
            { weight: null, reps: null, completed: false },
            { weight: null, reps: null, completed: false },
          ],
        },
        {
          id: 'ex_one_arm_db_row',
          name: 'One Arm Dumbbell Row',
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-dumbbell-rows-on-a-bench-42784-large.mp4',
          sets: 3,
          reps: '8-12',
          rest: 90,
          formCues: [
            'Place one knee and hand on a bench.',
            'Keep your back flat and parallel to the floor.',
            'Pull the dumbbell up towards your hip.',
            'Squeeze your lat muscle at the top of the movement.',
          ],
          loggedSets: [
            { weight: null, reps: null, completed: false },
            { weight: null, reps: null, completed: false },
            { weight: null, reps: null, completed: false },
          ],
        },
      ],
    },
  ],
};