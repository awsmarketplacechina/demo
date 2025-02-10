import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Project {
  id: number;
  createdAt: string;
  name: string;
  sourcePlatform: string;
  sourceAccount: string;
  targetPlatform: string;
  targetAccount: string;
  status: '配置中' | '配置完成';
}

interface ProjectContextType {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => number;
  updateProject: (id: number, updates: Partial<Project>) => void;
  getProject: (id: number) => Project | undefined;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    // Load projects from localStorage on mount
    const stored = localStorage.getItem('projects');
    return stored ? JSON.parse(stored) : [];
  });

  // Save projects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    const newId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
    const newProject: Project = {
      ...projectData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setProjects(prev => [...prev, newProject]);
    return newId;
  };

  const updateProject = (id: number, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project => 
      project.id === id ? { ...project, ...updates } : project
    ));
  };

  const getProject = (id: number) => {
    return projects.find(p => p.id === id);
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      addProject,
      updateProject,
      getProject
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectContext;
