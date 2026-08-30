import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Project } from '../types';
import { api } from '../services/api';

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  selectedProject: Project | null;
  selectProject: (project: Project | null) => void;
  fetchProjects: () => Promise<void>;
  createProject: (idea: string, techStack: string) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const selectProject = (project: Project | null) => {
    setSelectedProject(project);
  };

  const createProject = async (idea: string, techStack: string): Promise<Project> => {
    const generated = await api.generateFullProject(idea, techStack);
    const newProj = await api.createProject(
      generated.requirements?.summary?.slice(0, 30) || 'AI Application',
      idea
    );

    const updated = await api.updateProject(newProj.id, {
      status: 'complete',
      current_stage: 'complete',
      tech_stack: techStack,
      requirements: generated.requirements,
      architecture: generated.architecture,
      file_tree: generated.fileTree,
      tests: generated.tests,
      debug_results: generated.debug,
      review: generated.review,
    });

    setProjects((prev) => [updated, ...prev]);
    setSelectedProject(updated);
    return updated;
  };

  const deleteProject = async (id: string) => {
    await api.deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (selectedProject?.id === id) {
      setSelectedProject(null);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        loading,
        selectedProject,
        selectProject,
        fetchProjects,
        createProject,
        deleteProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectsContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectsContext must be used within a ProjectProvider');
  }
  return context;
};
