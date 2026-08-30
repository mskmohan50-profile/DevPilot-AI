import { RequirementAnalysis, ArchitecturePlan, FileNode, TestSuite, DebugResult, CodeReview } from '../types';

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString).getTime();
    const diffMs = Date.now() - date;
    const sec = Math.floor(diffMs / 1000);
    if (sec < 60) return 'just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day < 30) return `${day}d ago`;
    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

export function calculateProjectHealth(
  reqs?: RequirementAnalysis,
  arch?: ArchitecturePlan,
  tree?: FileNode,
  tests?: TestSuite,
  review?: CodeReview
): number {
  let total = 0;
  let count = 0;

  if (reqs) { total += 90; count++; }
  if (arch) { total += 95; count++; }
  if (tree) { total += 92; count++; }
  if (tests) {
    const passRate = tests.total > 0 ? (tests.passed / tests.total) * 100 : 100;
    total += passRate;
    count++;
  }
  if (review) { total += review.overall; count++; }

  return count > 0 ? Math.round(total / count) : 0;
}

export function healthColor(score: number): string {
  if (score >= 85) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-error';
}

export function healthBarColor(score: number): string {
  if (score >= 85) return 'bg-success';
  if (score >= 60) return 'bg-warning';
  return 'bg-error';
}

export function countFiles(node?: FileNode): number {
  if (!node) return 0;
  if (node.type === 'file') return 1;
  return (node.children || []).reduce((sum, child) => sum + countFiles(child), 0);
}

export function techStackLabel(id?: string): string {
  const map: Record<string, string> = {
    'react-fastapi-postgres': 'React + FastAPI + Postgres',
    'nextjs-tailwind-postgres': 'Next.js + Tailwind + Postgres',
    'nodejs-express-mongodb': 'Node.js + Express + MongoDB',
    'vue-python-sqlite': 'Vue.js + Flask + SQLite',
  };
  return (id && map[id]) || id || 'Unknown stack';
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
