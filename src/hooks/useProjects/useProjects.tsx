'use client';

import { useState, useMemo } from 'react';
import { Project } from '@/@types/interface/project.interface';
import { PROJECTS_DATA, PROJECTS_TEXT } from '@/constants/projects/projects.constant';

export const useProjects = () => {
  const [activeStatus, setActiveStatus] = useState<string>("All");

  const filteredProjects = useMemo(() => {
    return activeStatus === "All" 
      ? PROJECTS_DATA 
      : PROJECTS_DATA.filter(project => project.status === activeStatus);
  }, [activeStatus]);

  const handleStatusChange = (status: string) => {
    setActiveStatus(status);
  };

  const handleNewProject = () => {
    console.log('Creating new project...');
    // Add actual project creation logic here
  };

  const handleProjectClick = (id: number) => {
    console.log(`Opening project with id: ${id}`);
    // Add navigation or modal logic here
  };

  return {
    activeStatus,
    filteredProjects,
    handleStatusChange,
    handleNewProject,
    handleProjectClick,
  };
};
