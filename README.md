# DevPilot AI — Autonomous Full-Stack AI Software Engineer

DevPilot AI is an autonomous end-to-end software engineering platform. It accepts high-level natural language prompts, creates requirement specifications, formulates software architecture plans, writes full production-ready codebases (Frontend + Backend + Database), runs automated test suites, repairs bugs with a self-healing agent loop, and produces security/code quality reports.

---

## Project Structure

```text
devpilot-app/
├── frontend/    # React 18 + TypeScript + Vite + Tailwind CSS dashboard
├── backend/     # FastAPI Python server + SQLAlchemy ORM + JWT Auth
├── engine/      # Multi-agent AI engine microservice (Gemini 1.5 Pro)
├── database/    # PostgreSQL schemas and initialization scripts
└── docker-compose.yml
```

---

## Quick Start (Docker)

```bash
# 1. Copy environment template and add your Gemini API Key
cp .env.example .env

# 2. Build and start all services
docker-compose up --build
```

Access the UI at: **`http://localhost:3000`**  
Access the Backend API Docs at: **`http://localhost:8000/docs`**  
Access the AI Engine Microservice at: **`http://localhost:3001`**

### Option B: Run Services Locally
1. Engine:
cd "C:\Users\ELCOT\Downloads\devpilot-app\engine"
npm install
$env:GEMINI_API_KEY="your_key_here"
npm run dev
2. Backend:
cd "C:\Users\ELCOT\Downloads\devpilot-app\backend"
pip install -r requirements.txt
uvicorn app.main:app --reload
3. Frontend:
cd "C:\Users\ELCOT\Downloads\devpilot-app\frontend"
npm install
npm run dev