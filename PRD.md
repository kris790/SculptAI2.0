# **SculptAI - Physique Architecture PRD (v4.1)**

## **1. Executive Summary**
SculptAI is a premium physique development platform for beginners. We focus on "Architecture before Decoration," helping users build a symmetrical V-taper frame using AI-driven ratio tracking, real-time form coaching, and low-latency posing analysis.

## **2. Core Innovation**
- **Physique Ratio Analytics**: Real-time tracking of shoulder-to-waist proportions (Goal: 1.5:1).
- **AI Coaching Engine**: Powered by Gemini 3 Flash for instant form feedback.
- **Pose Architect Live**: Low-latency biomechanical feedback using Gemini 2.5 Live API for real-time vocal and visual posing correction.

## **3. Feature Roadmap**
- [x] **Phase 1: Foundation (Completed)**: Core Ratio Analytics & V-Taper Logic.
- [x] **Phase 2: Vision (Completed)**: AI Form Coaching (Gemini Vision) and Physique Analysis.
- [x] **Phase 3: Intelligence (Completed)**: Pro Network, Community Challenges, and **Live AI Posing Analysis**.
- [ ] **Phase 4: Optimization (Active)**: 3D Silhouette Visualization and personalized deload scheduling.

## **4. Technical Specifications (Implemented)**
- **Real-Time Coaching**: Utilizes `gemini-2.5-flash-native-audio-preview-12-2025` for sub-200ms audio-to-audio feedback.
- **Multi-Modal Processing**: Synchronized 1 FPS video frames paired with 16kHz PCM audio streams for context-aware biomechanical guidance.
- **Data Persistence**: Supabase PostgreSQL for tracking longitudinal hypertrophy progress.

## **5. Technical Stack**
- **Frontend**: React 19 + Tailwind CSS
- **Intelligence**: Google Gemini API (@google/genai)
- **Data**: Supabase (PostgreSQL)