# LBCA Monitor — Learning-Based Competency Assessment Monitoring System

## Project Description

LBCA Monitor is a full-stack academic monitoring platform designed for schools following the PACE (Personalized Achievement of Curriculum Education) learning model. It provides real-time visibility into student academic progress, risk levels, and pace performance across three interconnected platforms: a **web-based admin/teacher dashboard**, a **student/parent mobile app**, and a **REST API backend**. The system automatically flags at-risk students based on their pace percentage, enabling early intervention by teachers and administrators.

---

## Features

### 🌐 Web Dashboard (Admin & Teacher)
- **Role-based access** — separate views and permissions for Admins and Teachers
- **Dashboard overview** — KPI cards, pace forecast charts, at-risk student tables, and trend graphs
- **Student management** — enrollment records, pace tracking, and subject-level progress
- **Teacher management** — assignment tracking and teacher availability
- **Early warning system** — automatically categorizes students by risk level (Critical / High / Moderate / On Track)
- **PACE monitoring** — subject-by-subject pace percentage tracking per student
- **Pending approvals** — admin can approve or reject new staff registrations
- **Profile & settings** — staff profile management with photo upload
- **School year & section setup** — configure grade levels, sections, subjects, and school years
- **Data quality logs** — audit trail for data integrity

### 📱 Mobile App (Student / Parent)
- **Home dashboard** — overall pace ring, risk level, and trend overview
- **Grades screen** — subject-by-subject grade cards with animated progress bars
- **Alerts tab** — risk-grouped subject cards (Critical → High → Moderate → On Track)
- **Notifications** — unread badge, per-subject status updates with trend indicators
- **Schedule screen** — class schedule viewer
- **Light & dark mode** — full theme support via system preference
- **Pull-to-refresh** — live data sync on all screens

### 🔐 Authentication & Security
- JWT-based authentication (access + refresh tokens)
- OTP (One-Time Password) two-factor verification
- Device trust management
- Tiered login lockout policy (progressive lockout durations, permanent lock after 5 violations)
- Password strength validation and password reset flow
- Rate limiting on login, OTP, and password reset endpoints
- Audit logging for all sensitive actions

### ⚙️ Backend API
- RESTful endpoints for all entities: students, staff, subjects, sections, school years, enrollments, pace records, schedules, early warnings
- Dedicated mobile authentication router (`/api/mobile/`)
- S3-compatible automated database backup (optional)
- CORS-controlled access per environment

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Mobile App** | React Native (Expo ~54), Expo Router, `@expo/vector-icons` |
| **Web Frontend** | React 19, Vite, React Router v7, Recharts, Lucide React |
| **Backend** | FastAPI 0.104, Uvicorn, SQLAlchemy 2.0 (async) |
| **Database** | PostgreSQL (via `asyncpg` / `psycopg2`) |
| **Auth** | JWT (`python-jose`), bcrypt (`passlib`), Pydantic v2 |
| **Deployment — Backend** | Render (Python web service) |
| **Deployment — Web** | GitHub Pages (`gh-pages`) |
| **Deployment — Mobile** | EAS Build (Expo Application Services) |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Clients                              │
│                                                             │
│  ┌─────────────────┐        ┌─────────────────────────┐    │
│  │  Mobile App     │        │  Web Dashboard          │    │
│  │  (Expo/RN)      │        │  (React + Vite)         │    │
│  │  Student/Parent │        │  Admin / Teacher        │    │
│  └────────┬────────┘        └────────────┬────────────┘    │
│           │  JWT / REST API              │  JWT / REST API  │
└───────────┼──────────────────────────────┼─────────────────┘
            │                              │
            ▼                              ▼
┌───────────────────────────────────────────────────────────┐
│                  FastAPI Backend (Render)                  │
│                                                           │
│  /api/mobile/      /api/students/    /api/student-pace/   │
│  /api/early-warnings/  /api/sections/  /api/school-years/ │
│  /api/staff/       /api/subjects/    /api/schedules/      │
│                                                           │
│  Auth: JWT + OTP + Device Trust + Rate Limiting           │
└───────────────────────────────┬───────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   PostgreSQL Database  │
                    │   (Render / Supabase)  │
                    └───────────────────────┘
```

**Data flow:** The mobile app and web dashboard both authenticate via JWT tokens issued by the FastAPI backend. Student pace records and early warning flags are computed server-side and consumed by both clients. The mobile app uses a dedicated `/api/mobile/` authentication path for student/parent logins, while staff (admins and teachers) authenticate through the main staff auth flow.

---

## Installation & Setup

### Prerequisites
- Node.js ≥ 18
- Python 3.11+
- PostgreSQL database (local or cloud)
- Expo CLI (`npm install -g expo-cli`) — for mobile development

---

### 1. Backend (FastAPI)

```bash
# Clone the backend repo
git clone <backend-repo-url>
cd LBCA_Monitoring_System-backend_FASTAPI

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and set:
#   DATABASE_URL=postgresql+asyncpg://user:password@host/dbname
#   SECRET_KEY=your-secret-key
#   ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend.com

# Initialize the database
python init_db.py

# (Optional) Seed admin account
python seed_admin.py

# Run the development server
uvicorn main:app --reload --port 8001
```

API will be available at `http://localhost:8001`. Interactive docs at `http://localhost:8001/docs`.

---

### 2. Web Dashboard (React + Vite)

```bash
# Clone the frontend repo
git clone <frontend-repo-url>
cd LBCA_Monitoring_System_FASTAPI

# Install dependencies
npm install

# Configure environment
# Create a .env file:
echo "VITE_API_URL=http://localhost:8001" > .env

# Start development server
npm run dev
```

Dashboard will be available at `http://localhost:5173`.

---

### 3. Mobile App (Expo)

```bash
# From the mobile project folder
npm install

# Configure environment
# Edit constants/apiConfig.js to point to your backend URL

# Start Expo
npx expo start

# Run on Android / iOS
npx expo start --android
npx expo start --ios
```

---

## Deployment Link

- **Web Dashboard:** [https://shanmili.github.io/LBCA_Monitoring_System_FASTAPI](https://shanmili.github.io/LBCA_Monitoring_System_FASTAPI)
- **Backend API:** Deployed on [Render](https://render.com) — see `render.yaml` for service configuration
- **Mobile App:** Built and distributed via EAS Build (`eas.json`) — Android package: `com.seffzxc321.LBCA_Mobile`

---

## Test Account

Authentication is required to access the system. Contact the development team or an administrator to request a test account. Staff accounts require admin approval before login is granted.

> **Note:** New staff registrations go through a pending-approval flow. Admins must approve accounts via the Pending Approvals page before the account becomes active.

---

## Team Members and Roles

| Name | Role |
|---|---|
| *(Add team member)* | Frontend Developer (Web) |
| *(Add team member)* | Mobile Developer |
| *(Add team member)* | Backend Developer |
| *(Add team member)* | UI/UX Designer |
| *(Add team member)* | Project Manager |

---

## Known Limitations

- **AI model integration** is connected to an external Django service (`lbca-django-ai-model.onrender.com`) which may have cold-start delays on free-tier hosting.
- **Push notifications** are not yet implemented on the mobile app; in-app notification polling is used instead.
- **Offline support** is limited — all data requires an active internet connection.
- **iOS distribution** has not been tested on a physical device; development has been primarily Android-focused.
- The S3 backup integration in the backend is optional and requires manual configuration of AWS credentials in environment variables.
- PACE percentage calculations use simple averaging across multiple records per subject; more sophisticated weighted scoring is not yet implemented.

---

## Screenshots

> *(Add screenshots here — web dashboard, mobile home screen, grades view, alerts screen, etc.)*
