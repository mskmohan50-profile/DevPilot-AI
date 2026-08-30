import React, { useMemo, useState } from 'react';
import { useProjectsContext } from '../context/ProjectContext';
import { ProjectCard } from '../components/ProjectCard';
import { Plus, Search, FolderGit2, SlidersHorizontal, ArrowDownWideNarrow, X } from 'lucide-react';

interface SidebarProps {
  onNewProject: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'complete', label: 'Complete' },
  { id: 'running', label: 'Running' },
  { id: 'error', label: 'Error' },
];

export const Sidebar: React.FC<SidebarProps> = ({ onNewProject, isOpen, onClose }) => {
  const { projects, selectedProject, selectProject, deleteProject } = useProjectsContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortNewestFirst, setSortNewestFirst] = useState(true);

  const filtered = useMemo(() => {
    let list = projects.filter(
      (p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (statusFilter !== 'all') {
      list = list.filter((p) => p.status === statusFilter);
    }
    list = [...list].sort((a, b) => {
      const ta = new Date(a.created_at).getTime() || 0;
      const tb = new Date(b.created_at).getTime() || 0;
      return sortNewestFirst ? tb - ta : ta - tb;
    });
    return list;
  }, [projects, searchQuery, statusFilter, sortNewestFirst]);

  const counts = useMemo(() => {
    return {
      complete: projects.filter((p) => p.status === 'complete').length,
      running: projects.filter((p) => p.status === 'running').length,
      error: projects.filter((p) => p.status === 'error').length,
    };
  }, [projects]);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-surface border-r border-border flex flex-col shrink-0 transition-transform duration-300 ease-out
          md:static md:inset-auto md:z-auto md:w-80 md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between md:hidden">
            <span className="text-xs font-bold text-gray-300">Projects</span>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onNewProject}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold transition-all shadow-glow hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workspace projects..."
              className="w-full bg-surface-2 border border-border rounded-xl pl-8 pr-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-primary transition"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition ${
                  statusFilter === f.id
                    ? 'bg-primary/15 border-primary text-primary'
                    : 'bg-surface-2 border-border text-gray-400 hover:text-white'
                }`}
              >
                {f.label}
                {f.id !== 'all' && counts[f.id as keyof typeof counts] > 0 && (
                  <span className="ml-1 opacity-70">{counts[f.id as keyof typeof counts]}</span>
                )}
              </button>
            ))}
            <button
              onClick={() => setSortNewestFirst((s) => !s)}
              className="ml-auto shrink-0 p-1.5 rounded-lg bg-surface-2 border border-border text-gray-400 hover:text-white transition"
              title={sortNewestFirst ? 'Newest first' : 'Oldest first'}
            >
              <ArrowDownWideNarrow className={`w-3 h-3 transition-transform ${sortNewestFirst ? '' : 'rotate-180'}`} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-3 space-y-2">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 flex items-center justify-between mb-1">
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3 h-3" />
              Workspace Projects
            </span>
            <span className="bg-surface-2 px-1.5 py-0.5 rounded text-primary">{filtered.length}</span>
          </div>

          {filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-xs">
              <FolderGit2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No projects found</p>
            </div>
          ) : (
            filtered.map((proj) => (
              <ProjectCard
                key={proj.id}
                project={proj}
                isSelected={selectedProject?.id === proj.id}
                onSelect={() => {
                  selectProject(proj);
                  onClose();
                }}
                onDelete={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this project?')) {
                    deleteProject(proj.id);
                  }
                }}
              />
            ))
          )}
        </div>

        <div className="p-3 border-t border-border text-[10px] text-gray-500 flex items-center justify-between">
          <span>{projects.length} total</span>
          <span className="flex items-center gap-2">
            <span className="text-success">{counts.complete} ok</span>
            {counts.error > 0 && <span className="text-error">{counts.error} failed</span>}
          </span>
        </div>
      </aside>
    </>
  );
};
