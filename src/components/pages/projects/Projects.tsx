"use client";

import React from "react";
import { PageHeader, CategoryFilter, ProjectCard } from "@/components/shared";
import { useProjects } from "@/hooks/useProjects/useProjects";
import {
  PROJECT_STATUSES,
  PROJECTS_TEXT,
} from "@/constants/projects/projects.constant";
import { IGetProjectResponse } from "@/@types/api/project/project.interface";

const Projects: React.FC<IGetProjectResponse> = ({
  data,
  pagination,
  total,
}) => {
  const {
    activeStatus,
    filteredProjects,
    handleStatusChange,
    handleNewProject,
  } = useProjects();
  return (
    <div className="space-y-6 px-16 pt-10  bg-gradient-to-br from-slate-100 to-slate-200 min-h-[calc(100vh-64px)]">
      <PageHeader
        title={PROJECTS_TEXT.pageTitle}
        buttonText={PROJECTS_TEXT.newProjectButton}
        link="/create-project"
      />
      <div className="bl">
        <CategoryFilter
          categories={PROJECT_STATUSES}
          activeCategory={activeStatus}
          onCategoryChange={handleStatusChange}
        />
        {/* <hr className="my-4 border-gray-200" /> */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((project) => (
            <ProjectCard
              key={project._id}
              {...project}
              created_by_details={project.created_by_details}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
