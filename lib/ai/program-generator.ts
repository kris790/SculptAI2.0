
import { GoogleGenAI } from "@google/genai";

interface UserProtocolData {
  goal: string;
  currentRatio: string;
  targetRatio: number;
  timelineWeeks: number;
  bio: {
    gender: string;
    age: string;
    height: string;
    weight: string;
    experience: string;
  };
}

export async function generateTrainingProgram(userData: UserProtocolData): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    You are the SculptAI Architect, an elite world-class physique competition coach specializing in the V-Taper aesthetic.
    
    User Profile:
    - Trajectory: ${userData.goal}
    - Current Shoulder-to-Waist Ratio: ${userData.currentRatio}
    - Target Ratio: ${userData.targetRatio}
    - Phase Timeline: ${userData.timelineWeeks} weeks
    - Experience Level: ${userData.bio.experience}
    - Biological Baseline: ${userData.bio.gender}, ${userData.bio.age}y, ${userData.bio.height}cm, ${userData.bio.weight}lbs
    
    Task: Design a comprehensive, elite-level physique architecture program.
    
    Requirements:
    1. **Symmetry Protocol**: Specific exercises to improve the V-Taper (Lateral delts, Lat width, Waist control).
    2. **Weekly Cadence**: Recommended training frequency and split based on experience level.
    3. **Progression Strategy**: How to handle load and volume over the ${userData.timelineWeeks} week period.
    4. **Nutrition & Recovery Architecture**: Macros/Calorie guidance and deload timing.
    5. **Architect's Note**: A professional, high-impact closing statement.
    
    Format the output in clean Markdown with bold headers. Maintain a professional, technical, and motivating tone.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

    return response.text || "Protocol generation failed. Please re-run the architecture scan.";
  } catch (error) {
    console.error("Program Generation Error:", error);
    return "Error initializing protocol. Architecture logic timed out.";
  }
}
