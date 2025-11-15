# SculptAI - Product Requirements Document (PRD)

**Version:** 3.0
**Status:** In Development - Phase 3: Intelligence & Scale
**Date:** 2024-10-27

---

## 1. Executive Summary

This document outlines the requirements for Phase 3 of SculptAI, "Intelligence & Scale." Building on the foundational workout logging (Phase 1) and community features (Phase 2), this phase introduces a true data-driven personalization engine and a monetization strategy through a professional coach marketplace. The core objective is to transition SculptAI from a static application to a dynamic, intelligent platform that provides deeper value to users and creates revenue opportunities.

## 2. Key Objectives & Success Metrics

### 2.1. Objectives
- **Transition from Rule-Based to Data-Driven Personalization:** Implement a machine learning model to provide users with actionable training recommendations.
- **Implement a Coach Marketplace:** Create a new section where users can browse, view, and book services from verified professional coaches.
- **Provide Deeper Data Insights:** Enhance the user dashboard with visual analytics to help users better understand their progress.
- **Scale Infrastructure:** Implement a scalable backend and data architecture to support ML processing and future growth.

### 2.2. Success Metrics (Phase 3)
- **AI Engagement:** > 25% of active users interact with an AI recommendation within the first month.
- **Marketplace Engagement:** Achieve a > 10% click-through rate from the coach directory to individual coach profiles.
- **Technical Performance:** Maintain API response times of < 500ms for all new endpoints under normal load.
- **Data Integrity:** Successfully execute the daily ETL pipeline with a > 99% success rate.

---

## 3. Core Features

### 3.1. AI Recommendation Engine
- **Functionality:** A new panel on the user's dashboard will display personalized training insights. The initial model will focus on recommending when to take a deload week, increase training volume, or maintain the current load based on performance trends.
- **User Experience:** Recommendations will be presented as clear, concise advice. The system will operate as a "black box" to the user, providing the output without exposing the underlying data points.
- **Technical Implementation:**
    - A Next.js API route (`/api/ai/recommendations`) will act as a secure proxy.
    - This route fetches the user's recent workout data from Supabase.
    - It performs feature engineering to create a feature set (e.g., average volume, frequency, strength level).
    - It sends the feature set to a separate, Python-based FastAPI microservice.
    - The FastAPI service hosts a pre-trained ML model, which returns a recommendation.

### 3.2. Coach Marketplace
- **Functionality:** A new "Coaches" tab in the main navigation will lead to a marketplace where users can find and hire verified fitness coaches.
- **User Experience:**
    - **Directory View:** A grid or list view of all verified coaches, showing their profile picture, name, and specialties.
    - **Profile View:** A detailed page for each coach, displaying their bio, certifications, coaching style, and a list of services they offer (e.g., "3-Month Powerlifting Prep").
    - **Service Listings:** Each service will have a title, description, duration, and price. A "Book Now" button will be present (note: payment integration is a future step).
- **Technical Implementation:**
    - New tables in the Supabase database: `coaches`, `coach_listings`, `coach_bookings`.
    - A Next.js API route (`/api/coaches`) will fetch all verified coaches and their active listings.
    - Frontend components (`CoachMarketplace.tsx`, `CoachProfile.tsx`) will consume this API to render the marketplace.

### 3.3. Advanced Progress Analytics
- **Functionality:** The main dashboard will be enhanced with a new data visualization component.
- **User Experience:** A line chart will display the user's weight progression over time, based on data from their progress logs. This provides a clear, visual representation of their long-term trends.
- **Technical Implementation:**
    - A new React component (`ProgressDashboard.tsx`) will be created.
    - It will utilize the `recharts` library to render the chart.
    - Data will be fetched using the existing `useProgressLogs` hook on the client side.

---

## 4. Technical Architecture

### 4.1. Tech Stack
- **Frontend & Backend:** Next.js 14 (App Router), React, Tailwind CSS
- **Database & Auth:** Supabase (Postgres)
- **ML Service:** Python, FastAPI, Scikit-learn, Pandas
- **Data Warehouse:** Google BigQuery (for analytics and model training data)
- **Deployment:**
    - **Next.js App:** Vercel
    - **ML Service:** Docker container on Google Cloud Run (or similar service)
    - **Data Pipeline:** Scheduled job (e.g., GitHub Actions cron job)

### 4.2. Data & ML Pipeline (ETL)
- **Purpose:** To move workout data from the transactional Supabase database to an analytical data warehouse (BigQuery) where it can be used to train future iterations of the ML model.
- **Implementation:**
    - A Python script (`extract_and_load.py`) will run on a daily schedule.
    - It will connect to Supabase using a service role key to extract workout logs from the past 24 hours.
    - It will then connect to Google BigQuery and append this data to a `workout_logs_staging` table.

---

## 5. Out of Scope (For This Phase)

- Full Stripe integration for coach bookings.
- Real-time chat functionality between users and coaches.
- User-facing dashboards for coaches to manage their clients.
- Training and deploying new versions of the ML model (this phase focuses on serving the *first* model).
- Native mobile applications.
