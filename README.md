# JobPulse AI — Backend API

> REST API powering JobPulse AI — a smart job application tracker with ghost detection and analytics.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-black?logo=express)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-blue?logo=postgresql)](https://supabase.com)
[![Deploy](https://img.shields.io/badge/Deployed-Render-46E3B7?logo=render)](https://jobpulse-backend-qtsk.onrender.com)

**Live API:** https://jobpulse-backend-qtsk.onrender.com  
**Frontend:** https://jobpulse-frontend.vercel.app

---

## What This Does

- JWT Authentication — register and login with secure tokens
- Full Jobs CRUD — create, read, update, delete job applications
- Auto Ghost Detection — automatically marks jobs as ghosted after 15 days
- Ghost Warnings — flags jobs between 10–15 days old with no response
- Platform Analytics — breakdown of applications by company and platform
- Monthly Trends — tracks application volume over time
- Keep-Alive Ping — prevents Render free tier from sleeping

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Runtime | Node.js + Express |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Database | PostgreSQL via Supabase |
| Deploy | Render |

---

## How to Run Locally

### Step 1 — Clone
```bash
git clone https://github.com/Tejendra-dev/jobpulse-backend.git
cd jobpulse-backend
npm install
```

### Step 2 — Create your .env file
```bash
cp .env.example .env
```
Then open `.env` and fill in your actual values.

### Step 3 — Start the server
```bash
npm run dev
```
API runs at http://localhost:5000

---

## API Endpoints

### Auth
| Method | Endpoint | What it does |
|--------|----------|-------------|
| POST | /api/auth/register | Create new account |
| POST | /api/auth/login | Login and get token |

### Jobs (requires login token)
| Method | Endpoint | What it does |
|--------|----------|-------------|
| GET | /api/jobs | Get all your jobs |
| POST | /api/jobs | Add a new job |
| PUT | /api/jobs/:id | Update a job |
| DELETE | /api/jobs/:id | Delete a job |

### Analytics (requires login token)
| Method | Endpoint | What it does |
|--------|----------|-------------|
| GET | /api/analytics | Get stats, ghost data, trends |

---

## Folder Structure![5](https://github.com/user-attachments/assets/c09e9f95-53cc-4c14-928e-f0097aa1d08b)
![4](https://github.com/user-attachments/assets/05a5b0ac-0f4e-4c88-bef6-6d9d507278b1)
![3](https://github.com/user-attachments/assets/ab469ebd-e790-4ea2-9f63-4a75d874bae0)
![2](https://github.com/user-attachments/assets/35fcae97-c110-42a2-9f5d-1fd54a447aa2)
![1](https://github.com/user-attachments/assets/13b41380-2d24-4fa7-aa21-231b4067d70f)


jobpulse-backend/
├── src/
│   ├── routes/
│   │   ├── auth.js        # Register and Login
│   │   ├── jobs.js        # Job CRUD operations
│   │   └── analytics.js   # Stats and trends
│   ├── middleware/
│   │   └── auth.js        # JWT token verification
│   ├── db/
│   │   └── index.js       # Database connection
│   └── server.js          # Main entry point
└── .env.example           # Sample environment variables

---

## Environment Variables

Create a `.env` file with these:
DATABASE_URL=your_supabase_session_pooler_url
JWT_SECRET=your_secret_key
FRONTEND_URL=https://jobpulse-frontend.vercel.app
PORT=5000

---

## Author

**Tejendra Ayyappa Reddy Syamala**  
B.E. Computer Science (Data Science) — Sathyabama University, Chennai  
GitHub: https://github.com/Tejendra-dev
