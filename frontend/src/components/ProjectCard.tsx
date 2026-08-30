import React from 'react';
import { Project } from '../types';
import { Trash2, ChevronRight, Layers, Loader2, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { formatRelativeTime, techStackLabel, healthBarColor } from '../utils/formatters';

interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

const STATUS_META: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  complete: { label: 'Complete', icon: CheckCircle2, className: 'text-success' },
  running: { label: 'Running', icon: Loader2, className: 'text-primary' },
  error: { label: 'Error', icon: AlertTriangle, className: 'text-error' },
  draft: { label: 'Draft', icon: Clock, className: 'text-gray-400' },
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const meta = STATUS_META[project.status] || STATUS_META.complete;
  const StatusIcon = meta.icon;
  const health = project.health_score?.codeQuality ?? (project.status === 'complete' ? 90 : undefined);

  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-xl cursor-pointer border transition-all group relative card-hover ${
        isSelected
          ? 'bg-primary/10 border-primary text-white shadow-glow'
          : 'bg-surface-2 border-border hover:border-primary/40 text-gray-300'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-xs truncate max-w-[150px]">{project.title}</h3>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1 hover:text-error text-gray-400 transition"
          title="Delete Project"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-[11px] text-gray-400 line-clamp-1 mb-2">{project.description}</p>

      {project.tech_stack && (
        <div className="text-[10px] text-gray-500 mb-2 truncate flex items-center gap-1">
          <Layers className="w-3 h-3 shrink-0" />
          <span className="truncate">{techStackLabel(project.tech_stack)}</span>
        </div>
      )}

      {typeof health === 'number' && (
        <div className="mb-2">
          <div className="h-1 bg-surface rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${healthBarColor(health)}`} style={{ width: `${health}%` }} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-[10px]">
        <span className={`bg-surface px-2 py-0.5 rounded font-medium flex items-center gap-1 border border-border ${meta.className}`}>
          <StatusIcon className={`w-3 h-3 ${project.status === 'running' ? 'animate-spin' : ''}`} />
          <span>{meta.label}</span>
        </span>
        <div className="flex items-center gap-1.5 text-gray-500">
          {project.created_at && <span>{formatRelativeTime(project.created_at)}</span>}
          <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-primary transition" />
        </div>
      </div>
    </div>
  );
};
