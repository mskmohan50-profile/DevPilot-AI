import React, { useState } from 'react';
import { useProjectsContext } from '../context/ProjectContext';
import { usePipeline } from '../hooks/usePipeline';
import { PipelineProgress } from '../components/PipelineProgress';
import { Zap, Loader2, ChevronRight, Sparkles } from 'lucide-react';
import { TechStackChoice } from '../types';

interface NewProjectPageProps {
  onCancel: () => void;
}

const TECH_STACKS: { id: TechStackChoice; label: string; desc: string; icon: string; tags: string[] }[] = [
  { id: 'react-fastapi-postgres', label: 'React + FastAPI + PostgreSQL', desc: 'High performance API with modern SPA frontend', icon: '⚡', tags: ['SPA', 'REST', 'SQL'] },
  { id: 'nextjs-tailwind-postgres', label: 'Next.js 14 + Tailwind + Postgres', desc: 'Full-stack React framework with SSR and App Router', icon: '▲', tags: ['SSR', 'Tailwind', 'SQL'] },
  { id: 'nodejs-express-mongodb', label: 'Node.js + Express + MongoDB', desc: 'Classic flexible MERN stack architecture', icon: '🟢', tags: ['MERN', 'NoSQL'] },
  { id: 'vue-python-sqlite', label: 'Vue.js + Flask + SQLite', desc: 'Lightweight rapid prototyping stack', icon: '🧪', tags: ['Lightweight', 'Prototype'] },
];

const EXAMPLE_CATEGORIES: { label: string; ideas: string[] }[] = [
  {
    label: 'Marketplace',
    ideas: [
      'Build a job portal where users can search, post, and apply for jobs',
      'Create an ecommerce store with products, cart, and checkout',
    ],
  },
  {
    label: 'Productivity',
    ideas: [
      'Create a task management app with projects, kanban boards, and assignments',
      'Build a note-taking app with folders, tags, and full-text search',
    ],
  },
  {
    label: 'Business',
    ideas: [
      'Build an expense management application for small businesses',
      'Create a CRM for tracking leads, deals, and customer follow-ups',
    ],
  },
];

export const NewProjectPage: React.FC<NewProjectPageProps> = ({ onCancel }) => {
  const { createProject } = useProjectsContext();
  const { running, currentStage, progressLog } = usePipeline();
  const [idea, setIdea] = useState('');
  const [selectedStack, setSelectedStack] = useState<TechStackChoice>('react-fastapi-postgres');
  const [activeCategory, setActiveCategory] = useState(0);

  const handleLaunch = async () => {
    if (!idea.trim() || running) return;
    try {
      await createProject(idea.trim(), selectedStack);
      onCancel();
    } catch (err: any) {
      alert('Error launching pipeline: ' + (err?.message || 'Check connection'));
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-2xl w-full mx-auto overflow-auto">
      <div className="bg-surface rounded-xl border border-border p-5 w-full shadow-xl animate-slideUp">
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <h2 className="text-base font-bold text-white">Describe your software idea</h2>
        </div>
        <p className="text-gray-400 text-[11px] mb-4 leading-relaxed">
          DevPilot Multi-Agent Engine will analyze requirements, plan architecture, generate code, run QA tests, debug errors, and review security automatically.
        </p>

        <div className="relative">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={3}
            maxLength={600}
            placeholder="e.g. Build a job portal where users can register, search for jobs, post jobs, and apply..."
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs text-gray-200 resize-none focus:outline-none focus:border-primary transition"
            autoFocus
          />
          <span className="absolute bottom-1.5 right-2.5 text-[9px] text-gray-500">{idea.length}/600</span>
        </div>

        {/* Tech Stack Selector */}
        <div className="mt-3.5">
          <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-1.5 font-semibold">
            Target Architecture & Tech Stack
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {TECH_STACKS.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setSelectedStack(st.id)}
                className={`p-2 rounded-lg border text-left transition cursor-pointer card-hover ${
                  selectedStack === st.id
                    ? 'bg-primary/10 border-primary text-primary shadow-glow'
                    : 'bg-surface-2 border-border hover:border-primary/30 text-gray-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium text-[11px] text-white mb-0.5">
                  <span>{st.icon}</span>
                  <span>{st.label}</span>
                </div>
                <p className="text-[9px] text-gray-400 mb-1 leading-snug">{st.desc}</p>
                <div className="flex flex-wrap gap-1">
                  {st.tags.map((tag) => (
                    <span key={tag} className="text-[8px] bg-surface px-1 py-0.5 rounded border border-border text-gray-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Example Ideas */}
        <div className="mt-3.5">
          <div className="flex items-center gap-1 mb-1.5">
            {EXAMPLE_CATEGORIES.map((cat, i) => (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(i)}
                className={`px-2 py-0.5 rounded-md text-[9px] font-semibold border transition ${
                  activeCategory === i
                    ? 'bg-primary/15 border-primary text-primary'
                    : 'bg-surface-2 border-border text-gray-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="space-y-1">
            {EXAMPLE_CATEGORIES[activeCategory].ideas.map((ex, i) => (
              <button
                key={i}
                onClick={() => setIdea(ex)}
                className="w-full text-left px-2.5 py-1.5 rounded-md bg-surface-2 hover:bg-border/40 text-[11px] text-gray-300 hover:text-white transition flex items-center gap-1.5 group"
              >
                <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-primary transition shrink-0" />
                <span>{ex}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Realtime Pipeline Execution */}
        {running && (
          <div className="mt-4">
            <PipelineProgress currentStage={currentStage} logs={progressLog} />
          </div>
        )}

        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={handleLaunch}
            disabled={!idea.trim() || running}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark disabled:opacity-40 text-white text-[11px] font-semibold transition shadow-glow"
          >
            {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            <span>{running ? 'Executing Pipeline...' : 'Launch AI Pipeline'}</span>
          </button>
          <button
            onClick={onCancel}
            disabled={running}
            className="px-3.5 py-2 rounded-lg text-[11px] text-gray-400 hover:text-white transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
