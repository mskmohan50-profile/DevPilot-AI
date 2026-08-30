# 🚀 DevPilot AI — Autonomous Full-Stack AI Software Engineer

DevPilot AI is an autonomous, end-to-end **AI software engineering platform**.

It accepts a high-level natural-language software requirement and helps transform it into a complete application through an agentic workflow:

**Requirements → Architecture → Code → Testing → Debugging → Self-Healing → Security Review**

DevPilot can generate **Frontend + Backend + Database** code, run automated tests, analyze failures, repair bugs, and produce code-quality and security reports.

---

## ✨ Key Features

* 📝 Natural-language requirement analysis
* 🏗️ AI software architecture planning
* 🤖 Full-stack code generation
* 🎨 Frontend generation
* ⚙️ Backend/API generation
* 🗄️ Database schema generation
* 🧪 Automated test generation and execution
* 🔍 AI error and root-cause analysis
* 🔧 Autonomous bug fixing
* 🔄 Self-healing test → fix → retest loop
* 🔐 Security analysis
* 👨‍💻 AI code-quality review
* 📊 Project health and quality reports
* 🧠 Project context and development memory

---

## 🧠 Agentic Workflow

```text
User Requirement
       ↓
Requirement Agent
       ↓
Architecture Agent
       ↓
Code Generation Agent
       ↓
Test Agent
       ↓
Run Tests
       ↓
   ┌───┴───┐
   ↓       ↓
 PASS     FAIL
   ↓       ↓
   │   Debug Agent
   │       ↓
   │   Fix Agent
   │       ↓
   │    Retest
   │       ↓
   └───┬───┘
       ↓
 Code Review Agent
       ↓
Project Health Report
```

# 🛠️ Technology Stack

### Frontend

* React 18
* TypeScript
* Vite
* Tailwind CSS

### Backend

* Python
* FastAPI
* SQLAlchemy
* JWT Authentication

### AI Engine

* Node.js
* TypeScript
* Gemini API
* Multi-agent workflow

### Database

* PostgreSQL

### DevOps

* Docker
* Docker Compose
* Git

---

# 🚀 Quick Start — Docker

Docker is the easiest way to run the complete application.

## 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd devpilot-app
```

## 2. Create the environment file

Copy the example environment file:

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

### macOS / Linux

```bash
cp .env.example .env
```

Open `.env` and add your API key:

```env
GEMINI_API_KEY=your_api_key_here
```

**Never commit your real API key to GitHub.**

## 3. Start all services

```bash
docker-compose up --build
```

After the containers start, access:

| Service           | URL                        |
| ----------------- | -------------------------- |
| Frontend          | http://localhost:3000      |
| Backend API       | http://localhost:8000      |
| API Documentation | http://localhost:8000/docs |
| AI Engine         | http://localhost:3001      |

## 4. Stop the application

```bash
docker-compose down
```

---

# 💻 Option B — Run Locally

If you don't want to use Docker, run each service separately.

---

## 1️⃣ Start the AI Engine

Open **PowerShell**:

```powershell
cd engine"
```

Install dependencies:

```powershell
npm install
```

Set your Gemini API key for the current terminal session:

```powershell
$env:GEMINI_API_KEY="your_api_key_here"
```

Start the development server:

```powershell
npm run dev
```

The AI Engine should run on:

```text
http://localhost:3001
```

---

## 2️⃣ Start the Backend

Open a **new PowerShell window**:

```powershell
cd backend
```

Create/activate your Python virtual environment:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
pip install -r requirements.txt
```

Start FastAPI:

```powershell
uvicorn app.main:app --reload --port 8000
```

Backend:

```text
http://localhost:8000
```

Swagger API documentation:

```text
http://localhost:8000/docs
```

---

## 3️⃣ Start the Frontend

Open another **PowerShell window**:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

Start Vite:

```powershell
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

> If your Vite configuration uses port `3000`, use `http://localhost:3000` instead.


## 👨‍💻 Development

Built with:

**React • TypeScript • FastAPI • Python • PostgreSQL • Node.js • Gemini • Docker**
