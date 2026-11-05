import { Project } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '');

export const api = {
  getProjects: async (): Promise<Project[]> => {
    const res = await fetch(`${API_BASE}/projects`);
    if (!res.ok) return [];
    return res.json();
  },

  createProject: async (title: string, description: string): Promise<Project> => {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });
    return res.json();
  },

  generateFullProject: async (idea: string, techStack: string = 'react-fastapi-postgres') => {
    const res = await fetch(`${API_BASE}/engine/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea, tech_stack: techStack }),
    });
    return res.json();
  },

  updateProject: async (id: string, payload: Partial<Project>): Promise<Project> => {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  exportZip: async (fileTree: any, title?: string): Promise<Blob> => {
    const res = await fetch(`${API_BASE}/engine/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileTree, title }),
    });
    if (!res.ok) {
      throw new Error('Failed to generate export zip');
    }
    return res.blob();
  },

  deleteProject: async (id: string): Promise<boolean> => {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  },
};
