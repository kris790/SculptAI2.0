# SculptAI Pro 🏆

**The Elite Physique Architecture Platform**

SculptAI is a specialized fitness ecosystem designed for athletes who treat their training like architecture. We prioritize structural symmetry, primarily targeting the **1.5:1 shoulder-to-waist "Golden Ratio"**.

## 🚀 Completed Innovations

- ✅ **V-Taper Ratio Tracking**: Precise calculation of aesthetic proportions using longitudinal data.
- ✅ **AI Form Assistant**: Real-time coaching insights via Gemini 3 Flash to optimize compound movement patterns.
- ✅ **Pose Architect Live**: High-performance, low-latency posing feedback utilizing the Gemini 2.5 Live API.
- ✅ **Pro Network**: Direct integration with verified physique specialists.
- ✅ **Community Challenges**: Automated tracking of progress against global symmetry standards.

## 🛠 Configuration & Environment

### 1. Google Gemini API (Required for Intelligence)
The intelligence layer requires a valid Google Gemini API Key.
- **Env Variable**: `process.env.API_KEY`
- **Supported Models**: `gemini-3-flash-preview` (Vision/Text), `gemini-2.5-flash-native-audio-preview-12-2025` (Live API).
- **Permissions**: Ensure your browser profile allows Camera and Microphone access.

### 2. Supabase Configuration
- **Tables Required**: `profiles`, `progress_logs`, `workouts`, `user_profiles`, `buddy_connections`, `athlete_spotlights`.
- **Auth**: Email/Password authentication is handled via `@supabase/auth-helpers-nextjs`.
- **Database**: PostgreSQL with Row Level Security (RLS) enabled for user privacy.

## 📦 Setup Instructions

```bash
# Install dependencies
npm install

# Set up local environment
# Ensure .env.local contains your SUPABASE_URL and API_KEY

# Run development server
npm run dev
```

## 📈 Roadmap

- [x] **Phase 1**: Core Ratio Analytics & V-Taper Logic
- [x] **Phase 2**: AI Coaching Integration (Gemini Vision)
- [x] **Phase 3**: Live AI Posing Analysis & Pro Network
- [ ] **Phase 4**: 3D Silhouette Visualization & Advanced Recovery Analytics

---
*Precision is the difference between a workout and a transformation.*