# SculptAI - Phase 3: Intelligence & Scale

A full-stack, AI-powered fitness application built with Next.js, Supabase, and a Python-based machine learning service. This version introduces AI-driven recommendations, a coach marketplace, and advanced analytics.

## Features

- **Secure Authentication**: Email/password sign-up and sign-in via Supabase Auth.
- **AI Recommendations**: A dedicated panel on the dashboard provides personalized training advice based on your workout history.
- **Guided Workouts**: Step-by-step workout sessions with video demonstrations.
- **Workout History & Progress Tracking**: Log workouts and physical measurements, with data saved securely to your account.
- **Advanced Analytics**: A new progress dashboard visualizes your weight trends over time.
- **Community Hub**: Connect with other users through spotlights, a buddy finder, and community challenges.
- **Coach Marketplace**: Browse and view profiles of verified professional coaches and their service listings.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Recharts
- **Backend**: Next.js API Routes, Supabase (Postgres, Auth)
- **ML Service**: Python, FastAPI, Scikit-learn (run in Docker)
- **Data Pipeline**: Python script for ETL from Supabase to a data warehouse (e.g., BigQuery).

## Getting Started

### 1. Configure Supabase

- Make sure you have a Supabase project set up.
- Run all the SQL scripts in the `supabase/migrations/` directory in your Supabase SQL Editor to set up the database tables and policies.

### 2. Configure Environment Variables

- Copy `.env.example` to `.env.local`.
- Fill in the required values for Supabase and your ML service.

### 3. Run the ML Service (Optional, for local development)

- Navigate to the `ml_service` directory.
- Build and run the Docker container:
  ```bash
  docker build -t sculpt-ai-ml .
  docker run -p 8000:8000 sculpt-ai-ml
  ```

### 4. Run the Next.js Application

- Install dependencies: `npm install`
- Run the development server: `npm run dev`
- Open [http://localhost:3000](http://localhost:3000) in your browser.