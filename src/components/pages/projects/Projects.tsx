'use client';

import React from 'react';
import { PageHeader, CategoryFilter, ProjectCard } from '@/components/shared';
import { useProjects } from '@/hooks/useProjects/useProjects';
import { PROJECT_STATUSES, PROJECTS_TEXT } from '@/constants/projects/projects.constant';

const Projects: React.FC = () => {
  const {
    activeStatus,
    filteredProjects,
    handleStatusChange,
    handleNewProject,
    handleProjectClick,
  } = useProjects();

  return (
    <div className="space-y-6">
      <PageHeader 
        title={PROJECTS_TEXT.pageTitle}
        buttonText={PROJECTS_TEXT.newProjectButton}
        onButtonClick={handleNewProject}
      />

      <CategoryFilter 
        categories={PROJECT_STATUSES}
        activeCategory={activeStatus}
        onCategoryChange={handleStatusChange}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            {...project}
            onClick={handleProjectClick}
          />
        ))}
      </div>
    </div>
  );
};

export default Projects;
