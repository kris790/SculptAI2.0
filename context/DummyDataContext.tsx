
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DummyUser, generateDummyUser } from '../lib/dummy-data/generators';
import { MockAIService, GeneratedProgram, AIRecommendation } from '../lib/dummy-data/mock-ai-service';

interface DummyDataContextType {
  currentUser: DummyUser;
  aiProgram: GeneratedProgram | null;
  aiRecommendations: AIRecommendation[];
  updateUserGoal: (goal: DummyUser['goal']) => void;
  addMeasurement: (measurement: Partial<DummyUser['measurements'][0]>) => void;
  addWorkout: (workout: Partial<DummyUser['workouts'][0]>) => void;
  addNutritionLog: (log: Partial<DummyUser['nutritionLogs'][0]>) => void;
  analyzePose: (imageUrl: string) => Promise<any>;
  refreshData: () => void;
}

const DummyDataContext = createContext<DummyDataContextType | undefined>(undefined);

export function DummyDataProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<DummyUser>(() => generateDummyUser());
  const [aiProgram, setAiProgram] = useState<GeneratedProgram | null>(() => 
    MockAIService.generateProgram(generateDummyUser())
  );
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>(() =>
    MockAIService.generateRecommendations(generateDummyUser())
  );

  const updateUserGoal = (goal: DummyUser['goal']) => {
    const updatedUser = { ...currentUser, goal };
    setCurrentUser(updatedUser);
    
    // Regenerate AI program based on new goal
    const newProgram = MockAIService.generateProgram(updatedUser);
    setAiProgram(newProgram);
    
    // Update recommendations
    const newRecommendations = MockAIService.generateRecommendations(updatedUser);
    setAiRecommendations(newRecommendations);
  };

  const addMeasurement = (measurement: Partial<DummyUser['measurements'][0]>) => {
    const latest = currentUser.measurements[currentUser.measurements.length - 1];
    const shoulders = measurement.shoulders || latest?.shoulders || 48;
    const waist = measurement.waist || latest?.waist || 32;
    const newMeasurement = {
      id: `dummy-${Date.now()}`,
      date: new Date().toISOString(),
      shoulders,
      waist,
      weight: measurement.weight || 180,
      calculatedRatio: parseFloat((shoulders / waist).toFixed(2)),
      ...measurement,
    };
    
    const updatedUser = {
      ...currentUser,
      measurements: [...currentUser.measurements, newMeasurement],
    };
    
    setCurrentUser(updatedUser);
    
    // Update recommendations based on new measurement
    const newRecommendations = MockAIService.generateRecommendations(updatedUser);
    setAiRecommendations(newRecommendations);
  };

  const addWorkout = (workout: Partial<DummyUser['workouts'][0]>) => {
    const newWorkout = {
      id: `dummy-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'Full Body',
      exercises: [],
      duration: 60,
      volume: 5000,
      ...workout,
    };
    
    setCurrentUser({
      ...currentUser,
      workouts: [...currentUser.workouts, newWorkout],
    });
  };

  const addNutritionLog = (log: Partial<DummyUser['nutritionLogs'][0]>) => {
    const newLog = {
      id: `dummy-${Date.now()}`,
      date: new Date().toISOString(),
      calories: 2500,
      protein: 200,
      carbs: 250,
      fats: 70,
      waterOz: 100,
      ...log,
    };
    
    setCurrentUser({
      ...currentUser,
      nutritionLogs: [...currentUser.nutritionLogs, newLog],
    });
  };

  const analyzePose = async (imageUrl: string) => {
    return await MockAIService.analyzePose(imageUrl);
  };

  const refreshData = () => {
    const newUser = generateDummyUser();
    setCurrentUser(newUser);
    setAiProgram(MockAIService.generateProgram(newUser));
    setAiRecommendations(MockAIService.generateRecommendations(newUser));
  };

  return (
    <DummyDataContext.Provider
      value={{
        currentUser,
        aiProgram,
        aiRecommendations,
        updateUserGoal,
        addMeasurement,
        addWorkout,
        addNutritionLog,
        analyzePose,
        refreshData,
      }}
    >
      {children}
    </DummyDataContext.Provider>
  );
}

export const useDummyData = () => {
  const context = useContext(DummyDataContext);
  if (!context) {
    throw new Error('useDummyData must be used within DummyDataProvider');
  }
  return context;
}
