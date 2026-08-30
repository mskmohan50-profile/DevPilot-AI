import { generateJSON } from '../utils/gemini';
import { RequirementAnalysis } from './requirementAgent';
import { ArchitecturePlan } from './architectureAgent';

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  language?: string;
  content?: string;
  children?: FileNode[];
}

export type TechStackChoice =
  | 'react-fastapi-postgres'
  | 'nextjs-tailwind-postgres'
  | 'nodejs-express-mongodb'
  | 'vue-python-sqlite';

const STACK_LABELS: Record<TechStackChoice, string> = {
  'react-fastapi-postgres': 'React + FastAPI + PostgreSQL',
  'nextjs-tailwind-postgres': 'Next.js + Tailwind CSS + PostgreSQL',
  'nodejs-express-mongodb': 'Node.js + Express + MongoDB',
  'vue-python-sqlite': 'Vue.js + Python (Flask) + SQLite',
};

function appTitle(req: RequirementAnalysis): string {
  return req?.summary || 'DevPilot Generated App';
}

/* ------------------------------------------------------------------ */
/* Stack 1: React + FastAPI + PostgreSQL                               */
/* ------------------------------------------------------------------ */
function buildReactFastApiPostgres(req: RequirementAnalysis): FileNode {
  const title = appTitle(req);
  return {
    name: 'project',
    type: 'folder',
    children: [
      {
        name: 'backend',
        type: 'folder',
        children: [
          {
            name: 'main.py',
            type: 'file',
            language: 'python',
            content: `from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from database import engine, get_db, Base, ItemModel

Base.metadata.create_all(bind=engine)

app = FastAPI(title="${title}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Item(BaseModel):
    id: Optional[int] = None
    title: str
    completed: bool = False

    class Config:
        from_attributes = True

@app.get("/")
def read_root():
    return {"status": "ok", "message": "${title}"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/v1/items", response_model=List[Item])
def list_items(db: Session = Depends(get_db)):
    return db.query(ItemModel).all()

@app.post("/api/v1/items", response_model=Item, status_code=status.HTTP_201_CREATED)
def create_item(item: Item, db: Session = Depends(get_db)):
    db_item = ItemModel(title=item.title, completed=item.completed)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/api/v1/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(ItemModel).filter(ItemModel.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return None
`,
          },
          {
            name: 'database.py',
            type: 'file',
            language: 'python',
            content: `import os
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:devpilotpassword@db:5432/devpilot")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ItemModel(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    completed = Column(Boolean, default=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
`,
          },
          {
            name: 'requirements.txt',
            type: 'file',
            language: 'plaintext',
            content: `fastapi==0.110.0
uvicorn==0.28.0
pydantic==2.6.4
sqlalchemy==2.0.28
psycopg2-binary==2.9.9
python-jose==3.3.0
passlib==1.7.4
`,
          },
          {
            name: 'Dockerfile',
            type: 'file',
            language: 'dockerfile',
            content: `FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
`,
          },
        ],
      },
      {
        name: 'frontend',
        type: 'folder',
        children: [
          {
            name: 'package.json',
            type: 'file',
            language: 'json',
            content: `{
  "name": "devpilot-generated-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.344.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.1.6"
  }
}`,
          },
          {
            name: 'src',
            type: 'folder',
            children: [
              {
                name: 'App.tsx',
                type: 'file',
                language: 'typescript',
                content: `import React, { useState, useEffect } from 'react';

interface Item {
  id: number;
  title: string;
  completed: boolean;
}

const API_BASE = 'http://localhost:8000/api/v1';

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    fetch(\`\${API_BASE}/items\`)
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(err => console.error(err));
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const res = await fetch(\`\${API_BASE}/items\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, completed: false }),
    });
    const created = await res.json();
    setItems([...items, created]);
    setNewTitle('');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 font-sans">
      <h1 className="text-3xl font-bold mb-4">${title}</h1>
      <form onSubmit={handleAddItem} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="New entry title..."
          className="bg-slate-800 border border-slate-700 px-4 py-2 rounded text-sm w-80"
        />
        <button type="submit" className="bg-blue-600 px-4 py-2 rounded text-sm font-semibold hover:bg-blue-500">
          Add
        </button>
      </form>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="bg-slate-800 p-3 rounded flex items-center justify-between">
            <span>{item.title}</span>
            <span className="text-xs bg-slate-700 px-2 py-1 rounded">{item.completed ? 'Done' : 'Pending'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}`,
              },
              {
                name: 'main.tsx',
                type: 'file',
                language: 'typescript',
                content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
              },
            ],
          },
          {
            name: 'index.html',
            type: 'file',
            language: 'html',
            content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
          },
          {
            name: 'Dockerfile',
            type: 'file',
            language: 'dockerfile',
            content: `FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
`,
          },
        ],
      },
      {
        name: 'docker-compose.yml',
        type: 'file',
        language: 'yaml',
        content: `version: '3.8'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: devpilotpassword
      POSTGRES_DB: devpilot
    ports:
      - "5432:5432"
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://postgres:devpilotpassword@db:5432/devpilot
    depends_on:
      - db
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
`,
      },
      {
        name: 'README.md',
        type: 'file',
        language: 'markdown',
        content: readme(title, 'React + FastAPI + PostgreSQL', [
          '**backend/**: FastAPI REST service with SQLAlchemy ORM and PostgreSQL persistence.',
          '**frontend/**: React + TypeScript + Vite single page application.',
          '**docker-compose.yml**: Orchestration for backend, frontend & PostgreSQL.',
        ], ['docker compose up --build', 'Backend on http://localhost:8000', 'Frontend on http://localhost:3000']),
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Stack 2: Next.js + Tailwind CSS + PostgreSQL                        */
/* ------------------------------------------------------------------ */
function buildNextjsTailwindPostgres(req: RequirementAnalysis): FileNode {
  const title = appTitle(req);
  return {
    name: 'project',
    type: 'folder',
    children: [
      {
        name: 'package.json',
        type: 'file',
        language: 'json',
        content: `{
  "name": "devpilot-nextjs-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev"
  },
  "dependencies": {
    "next": "14.2.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@prisma/client": "^5.14.0",
    "jose": "^5.2.4",
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "prisma": "^5.14.0",
    "typescript": "^5.4.5",
    "tailwindcss": "^3.4.3",
    "postcss": "^8.4.38",
    "autoprefixer": "^10.4.19",
    "@types/node": "^20.12.11",
    "@types/react": "^18.3.1",
    "@types/bcryptjs": "^2.4.6"
  }
}`,
      },
      {
        name: 'tailwind.config.ts',
        type: 'file',
        language: 'typescript',
        content: `import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
export default config;
`,
      },
      {
        name: 'postcss.config.js',
        type: 'file',
        language: 'javascript',
        content: `module.exports = {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
`,
      },
      {
        name: 'prisma',
        type: 'folder',
        children: [
          {
            name: 'schema.prisma',
            type: 'file',
            language: 'plaintext',
            content: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
}

model Item {
  id        Int      @id @default(autoincrement())
  title     String
  completed Boolean  @default(false)
  createdAt DateTime @default(now())
}
`,
          },
        ],
      },
      {
        name: 'app',
        type: 'folder',
        children: [
          {
            name: 'layout.tsx',
            type: 'file',
            language: 'typescript',
            content: `import './globals.css';
import type { ReactNode } from 'react';

export const metadata = { title: '${title}' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white min-h-screen">{children}</body>
    </html>
  );
}
`,
          },
          {
            name: 'globals.css',
            type: 'file',
            language: 'css',
            content: `@tailwind base;
@tailwind components;
@tailwind utilities;
`,
          },
          {
            name: 'page.tsx',
            type: 'file',
            language: 'typescript',
            content: `import { prisma } from '../lib/prisma';

export default async function Home() {
  const items = await prisma.item.findMany({ orderBy: { createdAt: 'desc' } });

  async function addItem(formData: FormData) {
    'use server';
    const title = formData.get('title') as string;
    if (!title?.trim()) return;
    await prisma.item.create({ data: { title } });
  }

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">${title}</h1>
      <form action={addItem} className="flex gap-2 mb-6">
        <input
          name="title"
          placeholder="New entry title..."
          className="bg-slate-800 border border-slate-700 px-4 py-2 rounded text-sm flex-1"
        />
        <button className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded text-sm font-semibold" type="submit">
          Add
        </button>
      </form>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="bg-slate-800 p-3 rounded flex items-center justify-between">
            <span>{item.title}</span>
            <span className="text-xs bg-slate-700 px-2 py-1 rounded">{item.completed ? 'Done' : 'Pending'}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
`,
          },
          {
            name: 'api',
            type: 'folder',
            children: [
              {
                name: 'items',
                type: 'folder',
                children: [
                  {
                    name: 'route.ts',
                    type: 'file',
                    language: 'typescript',
                    content: `import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  const items = await prisma.item.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const body = await req.json();
  const item = await prisma.item.create({ data: { title: body.title, completed: !!body.completed } });
  return NextResponse.json(item, { status: 201 });
}
`,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: 'lib',
        type: 'folder',
        children: [
          {
            name: 'prisma.ts',
            type: 'file',
            language: 'typescript',
            content: `import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
`,
          },
        ],
      },
      {
        name: '.env.example',
        type: 'file',
        language: 'plaintext',
        content: `DATABASE_URL="postgresql://postgres:devpilotpassword@localhost:5432/devpilot"
NEXTAUTH_SECRET="change-me"
`,
      },
      {
        name: 'Dockerfile',
        type: 'file',
        language: 'dockerfile',
        content: `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
`,
      },
      {
        name: 'docker-compose.yml',
        type: 'file',
        language: 'yaml',
        content: `version: '3.8'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: devpilotpassword
      POSTGRES_DB: devpilot
    ports:
      - "5432:5432"
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:devpilotpassword@db:5432/devpilot
    depends_on:
      - db
`,
      },
      {
        name: 'README.md',
        type: 'file',
        language: 'markdown',
        content: readme(title, 'Next.js 14 (App Router) + Tailwind CSS + PostgreSQL/Prisma', [
          '**app/**: Next.js App Router pages, layouts, and API routes.',
          '**prisma/schema.prisma**: Database schema for Prisma ORM.',
          '**lib/prisma.ts**: Shared Prisma client instance.',
        ], ['npm install', 'npx prisma migrate dev', 'npm run dev', 'App on http://localhost:3000']),
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Stack 3: Node.js + Express + MongoDB                                */
/* ------------------------------------------------------------------ */
function buildNodeExpressMongo(req: RequirementAnalysis): FileNode {
  const title = appTitle(req);
  return {
    name: 'project',
    type: 'folder',
    children: [
      {
        name: 'backend',
        type: 'folder',
        children: [
          {
            name: 'package.json',
            type: 'file',
            language: 'json',
            content: `{
  "name": "devpilot-express-backend",
  "version": "1.0.0",
  "main": "server.js",
  "type": "commonjs",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "mongoose": "^8.4.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}`,
          },
          {
            name: 'server.js',
            type: 'file',
            language: 'javascript',
            content: `require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const itemRoutes = require('./routes/items');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/devpilot';

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: '${title}' }));

app.use('/api/v1/items', itemRoutes);
app.use('/api/v1/auth', authRoutes);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
`,
          },
          {
            name: 'models',
            type: 'folder',
            children: [
              {
                name: 'Item.js',
                type: 'file',
                language: 'javascript',
                content: `const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
`,
              },
              {
                name: 'User.js',
                type: 'file',
                language: 'javascript',
                content: `const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
`,
              },
            ],
          },
          {
            name: 'routes',
            type: 'folder',
            children: [
              {
                name: 'items.js',
                type: 'file',
                language: 'javascript',
                content: `const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

router.get('/', async (_req, res) => {
  const items = await Item.find().sort({ createdAt: -1 });
  res.json(items);
});

router.post('/', async (req, res) => {
  const item = await Item.create({ title: req.body.title, completed: !!req.body.completed });
  res.status(201).json(item);
});

router.delete('/:id', async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

module.exports = router;
`,
              },
              {
                name: 'auth.js',
                type: 'file',
                language: 'javascript',
                content: `const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'devpilot-secret';

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: 'Email already registered' });
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashed });
  res.status(201).json({ id: user._id, email: user.email });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ access_token: token });
});

module.exports = router;
`,
              },
            ],
          },
          {
            name: '.env.example',
            type: 'file',
            language: 'plaintext',
            content: `PORT=5000
MONGO_URI=mongodb://mongo:27017/devpilot
JWT_SECRET=change-me
`,
          },
          {
            name: 'Dockerfile',
            type: 'file',
            language: 'dockerfile',
            content: `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
`,
          },
        ],
      },
      {
        name: 'frontend',
        type: 'folder',
        children: [
          {
            name: 'package.json',
            type: 'file',
            language: 'json',
            content: `{
  "name": "devpilot-vite-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.2.11"
  }
}`,
          },
          {
            name: 'index.html',
            type: 'file',
            language: 'html',
            content: `<!doctype html>
<html lang="en">
  <head><meta charset="UTF-8" /><title>${title}</title></head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
          },
          {
            name: 'src',
            type: 'folder',
            children: [
              {
                name: 'main.jsx',
                type: 'file',
                language: 'javascript',
                content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
`,
              },
              {
                name: 'App.jsx',
                type: 'file',
                language: 'javascript',
                content: `import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api/v1';

export default function App() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetch(\`\${API_BASE}/items\`).then(r => r.json()).then(setItems);
  }, []);

  const addItem = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const res = await fetch(\`\${API_BASE}/items\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    const created = await res.json();
    setItems([created, ...items]);
    setTitle('');
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 600, margin: '40px auto', color: '#fff', background: '#0f172a', padding: 24, borderRadius: 8 }}>
      <h1>${title}</h1>
      <form onSubmit={addItem} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="New item..." style={{ flex: 1, padding: 8 }} />
        <button type="submit">Add</button>
      </form>
      <ul>
        {items.map(item => (
          <li key={item._id}>{item.title} {item.completed ? '(done)' : ''}</li>
        ))}
      </ul>
    </div>
  );
}
`,
              },
            ],
          },
        ],
      },
      {
        name: 'docker-compose.yml',
        type: 'file',
        language: 'yaml',
        content: `version: '3.8'
services:
  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      MONGO_URI: mongodb://mongo:27017/devpilot
    depends_on:
      - mongo
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
`,
      },
      {
        name: 'README.md',
        type: 'file',
        language: 'markdown',
        content: readme(title, 'Node.js + Express + MongoDB', [
          '**backend/**: Express REST API with Mongoose ODM and JWT authentication.',
          '**frontend/**: React + Vite single page application.',
          '**docker-compose.yml**: Orchestration for backend, frontend & MongoDB.',
        ], ['docker compose up --build', 'Backend on http://localhost:5000', 'Frontend on http://localhost:3000']),
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Stack 4: Vue.js + Python (Flask) + SQLite                           */
/* ------------------------------------------------------------------ */
function buildVuePythonSqlite(req: RequirementAnalysis): FileNode {
  const title = appTitle(req);
  return {
    name: 'project',
    type: 'folder',
    children: [
      {
        name: 'backend',
        type: 'folder',
        children: [
          {
            name: 'app.py',
            type: 'file',
            language: 'python',
            content: `from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, Item

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///devpilot.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

CORS(app)
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route("/")
def index():
    return jsonify({"status": "ok", "message": "${title}"})

@app.route("/health")
def health():
    return jsonify({"status": "healthy"})

@app.route("/api/v1/items", methods=["GET"])
def list_items():
    items = Item.query.order_by(Item.id.desc()).all()
    return jsonify([i.to_dict() for i in items])

@app.route("/api/v1/items", methods=["POST"])
def create_item():
    data = request.get_json()
    item = Item(title=data.get("title", ""), completed=bool(data.get("completed", False)))
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201

@app.route("/api/v1/items/<int:item_id>", methods=["DELETE"])
def delete_item(item_id):
    item = Item.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return "", 204

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
`,
          },
          {
            name: 'models.py',
            type: 'file',
            language: 'python',
            content: `from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    completed = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {"id": self.id, "title": self.title, "completed": self.completed}
`,
          },
          {
            name: 'requirements.txt',
            type: 'file',
            language: 'plaintext',
            content: `Flask==3.0.3
Flask-SQLAlchemy==3.1.1
Flask-CORS==4.0.1
Flask-JWT-Extended==4.6.0
`,
          },
          {
            name: 'Dockerfile',
            type: 'file',
            language: 'dockerfile',
            content: `FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "app.py"]
`,
          },
        ],
      },
      {
        name: 'frontend',
        type: 'folder',
        children: [
          {
            name: 'package.json',
            type: 'file',
            language: 'json',
            content: `{
  "name": "devpilot-vue-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.27",
    "pinia": "^2.1.7"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.4",
    "vite": "^5.2.11"
  }
}`,
          },
          {
            name: 'index.html',
            type: 'file',
            language: 'html',
            content: `<!doctype html>
<html lang="en">
  <head><meta charset="UTF-8" /><title>${title}</title></head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`,
          },
          {
            name: 'src',
            type: 'folder',
            children: [
              {
                name: 'main.js',
                type: 'file',
                language: 'javascript',
                content: `import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

createApp(App).use(createPinia()).mount('#app');
`,
              },
              {
                name: 'App.vue',
                type: 'file',
                language: 'vue',
                content: `<template>
  <div class="container">
    <h1>${title}</h1>
    <form @submit.prevent="addItem" class="form">
      <input v-model="title" placeholder="New item..." />
      <button type="submit">Add</button>
    </form>
    <ul>
      <li v-for="item in items" :key="item.id">
        {{ item.title }} <span v-if="item.completed">(done)</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const API_BASE = 'http://localhost:5000/api/v1';
const items = ref([]);
const title = ref('');

async function fetchItems() {
  const res = await fetch(\`\${API_BASE}/items\`);
  items.value = await res.json();
}

async function addItem() {
  if (!title.value.trim()) return;
  const res = await fetch(\`\${API_BASE}/items\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: title.value }),
  });
  const created = await res.json();
  items.value.unshift(created);
  title.value = '';
}

onMounted(fetchItems);
</script>

<style scoped>
.container { max-width: 600px; margin: 40px auto; font-family: sans-serif; color: #fff; background: #0f172a; padding: 24px; border-radius: 8px; }
.form { display: flex; gap: 8px; margin-bottom: 16px; }
input { flex: 1; padding: 8px; }
</style>
`,
              },
            ],
          },
        ],
      },
      {
        name: 'docker-compose.yml',
        type: 'file',
        language: 'yaml',
        content: `version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
`,
      },
      {
        name: 'README.md',
        type: 'file',
        language: 'markdown',
        content: readme(title, 'Vue.js 3 + Python Flask + SQLite', [
          '**backend/**: Flask REST API with Flask-SQLAlchemy and a zero-config SQLite database.',
          '**frontend/**: Vue 3 (Composition API) + Pinia + Vite single page application.',
          '**docker-compose.yml**: Orchestration for backend & frontend services.',
        ], ['docker compose up --build', 'Backend on http://localhost:5000', 'Frontend on http://localhost:3000']),
      },
    ],
  };
}

function readme(title: string, stackLabel: string, structure: string[], runSteps: string[]): string {
  return `# ${title}

## Complete Runnable Application Stack
**Tech Stack:** ${stackLabel}

Generated autonomously by DevPilot Multi-Agent Engine.

### Structure
${structure.map(s => `- ${s}`).join('\n')}

### Getting Started
${runSteps.map(s => `1. ${s}`).join('\n')}
`;
}

const STACK_BUILDERS: Record<TechStackChoice, (req: RequirementAnalysis) => FileNode> = {
  'react-fastapi-postgres': buildReactFastApiPostgres,
  'nextjs-tailwind-postgres': buildNextjsTailwindPostgres,
  'nodejs-express-mongodb': buildNodeExpressMongo,
  'vue-python-sqlite': buildVuePythonSqlite,
};

function resolveStack(techStack: string): TechStackChoice {
  return (techStack in STACK_BUILDERS ? techStack : 'react-fastapi-postgres') as TechStackChoice;
}

export async function generateFileTree(
  req: RequirementAnalysis,
  arch: ArchitecturePlan,
  techStack: string = 'react-fastapi-postgres'
): Promise<FileNode> {
  const stackKey = resolveStack(techStack);
  const stackLabel = STACK_LABELS[stackKey];

  if (!process.env.GEMINI_API_KEY) {
    // Deterministic, fully working scaffold tailored to the exact chosen stack.
    return STACK_BUILDERS[stackKey](req);
  }

  const prompt = `
  You are a Senior Full-Stack Developer AI Agent.
  Target Tech Stack Chosen by User: "${stackLabel}" (key: "${stackKey}")
  Generate COMPLETE, RUNNABLE, non-truncated source code files tailored SPECIFICALLY and ONLY for the "${stackLabel}" stack.
  Do not mix in technologies from other stacks. Every file MUST contain actual full code implementations
  (DO NOT use placeholders, "// TODO", or "// rest of code").
  Include: full backend implementation, full frontend implementation, database setup/models,
  a Dockerfile for each service, a docker-compose.yml wiring every service together, a .env.example
  where relevant, and a README.md describing the exact stack and how to run it.

  Requirements: ${JSON.stringify(req)}
  Architecture: ${JSON.stringify(arch)}

  Output JSON matching the exact FileNode structure:
  {
    "name": "project",
    "type": "folder",
    "children": [...]
  }
  `;

  try {
    return await generateJSON<FileNode>(prompt);
  } catch (err) {
    // If the LLM call fails for any reason, fall back to the deterministic
    // stack-specific scaffold instead of silently returning the wrong stack.
    console.error('generateFileTree LLM error, falling back to static scaffold:', err);
    return STACK_BUILDERS[stackKey](req);
  }
}
