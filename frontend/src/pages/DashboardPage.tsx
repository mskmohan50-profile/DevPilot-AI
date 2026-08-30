import React from 'react';
import { useProjectsContext } from '../context/ProjectContext';
import {
  Plus, Zap, Code2, Cpu, ShieldCheck, TestTube2, GitBranch, Layers,
  FileCode2, Bug, ClipboardCheck, ArrowRight,
} from 'lucide-react';
import { countFiles, formatRelativeTime } from '../utils/formatters';

interface DashboardPageProps {
  onNewProject: () => void;
}

const FEATURES = [
  { icon: Code2, title: 'Full Source Code', desc: 'Complete backend, frontend & Docker configs generated.' },
  { icon: Cpu, title: 'Autonomous Debugging', desc: 'Root-cause analysis and automated code patch generation.' },
  { icon: ShieldCheck, title: 'Security Audit', desc: 'OWASP & production-readiness review scores.' },
  { icon: TestTube2, title: 'Automated QA', desc: 'Unit, integration & e2e test suites executed automatically.' },
  { icon: GitBranch, title: 'Architecture Planning', desc: 'Component structure, data flow & database design mapped out.' },
  { icon: Layers, title: 'Multi-Stack Support', desc: 'React, Next.js, Node, Vue — pick the stack that fits.' },
];

const PIPELINE_STEPS = [
  { icon: ClipboardCheck, title: 'Describe your idea', desc: 'Write a short prompt describing the app you want built.' },
  { icon: FileCode2, title: 'Requirements & Architecture', desc: 'AI agents analyze scope and design the system architecture.' },
  { icon: Code2, title: 'Code Generation', desc: 'Full-stack source code is generated file by file.' },
  { icon: Bug, title: 'Test, Debug & Review', desc: 'Automated tests run, bugs get patched, security gets audited.' },
];

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNewProject }) => {
  const { projects } = useProjectsContext();

  const totalFiles = projects.reduce((sum, p) => sum + countFiles(p.file_tree), 0);
  const totalTests = projects.reduce((sum, p) => sum + (p.tests?.total || 0), 0);
  const avgHealth = projects.length
    ? Math.round(
        projects.reduce((sum, p) => sum + (p.health_score?.codeQuality ?? (p.status === 'complete' ? 90 : 0)), 0) /
          projects.length
      )
    : 0;

  const stats = [
    { label: 'Projects Shipped', value: projects.length, icon: Layers },
    { label: 'Files Generated', value: totalFiles, icon: FileCode2 },
    { label: 'Tests Executed', value: totalTests, icon: TestTube2 },
    { label: 'Avg. Health Score', value: projects.length ? `${avgHealth}%` : '—', icon: ShieldCheck },
  ];

  return (
    <div className="flex-1 flex flex-col items-center p-4 sm:p-8 text-center max-w-4xl mx-auto overflow-auto w-full">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-6 animate-fadeIn">
        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span className="text-xs text-gray-300">Multi-Agent AI Engineering Loop Ready</span>
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight mb-3 text-white animate-slideUp">
        From Idea to Full Software Stack,
        <span className="block gradient-text mt-1">Automatically Generated.</span>
      </h1>

      <p className="text-gray-400 text-sm mb-8 max-w-xl mx-auto leading-relaxed">
        DevPilot plans requirements, designs multi-tier architecture, writes complete non-truncated source code, executes automated test suites, fixes bugs autonomously, and performs security audits.
      </p>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mb-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-surface p-4 rounded-xl border border-border text-left card-hover">
            <s.icon className="w-4 h-4 text-primary mb-2" />
            <div className="text-xl font-extrabold text-white">{s.value}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full mb-10 text-left">
        {FEATURES.map((f, i) => (
          <div key={i} className="bg-surface p-4 rounded-xl border border-border card-hover hover:border-primary/40">
            <f.icon className="w-5 h-5 text-primary mb-2" />
            <h3 className="font-bold text-xs text-white mb-1">{f.title}</h3>
            <p className="text-[11px] text-gray-400">{f.desc}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onNewProject}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-xs transition-all shadow-glow-lg hover:scale-[1.02] mb-12"
      >
        <Plus className="w-4 h-4" />
        <span>Create New Project </span>
      </button>

      {/* How it works */}
      <div className="w-full text-left mb-12">
        <h2 className="text-sm font-bold text-white mb-4 text-center">How the pipeline works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={i} className="relative bg-surface p-4 rounded-xl border border-border">
              <div className="w-6 h-6 rounded-full bg-primary/15 border border-primary/30 text-primary text-[10px] font-bold flex items-center justify-center mb-3">
                {i + 1}
              </div>
              <step.icon className="w-4 h-4 text-primary mb-2" />
              <h4 className="font-bold text-xs text-white mb-1">{step.title}</h4>
              <p className="text-[11px] text-gray-400">{step.desc}</p>
              {i < PIPELINE_STEPS.length - 1 && (
                <ArrowRight className="hidden md:block w-4 h-4 text-gray-600 absolute -right-2 top-1/2 -translate-y-1/2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent projects */}
      {projects.length > 0 && (
        <div className="w-full text-left">
          <h2 className="text-sm font-bold text-white mb-4">Recent projects</h2>
          <div className="space-y-2">
            {projects.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-surface p-3 rounded-xl border border-border text-xs">
                <div>
                  <span className="font-semibold text-gray-200">{p.title}</span>
                  <span className="text-gray-500 ml-2">{p.description.slice(0, 60)}{p.description.length > 60 ? '…' : ''}</span>
                </div>
                <span className="text-gray-500 shrink-0 ml-3">{formatRelativeTime(p.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
