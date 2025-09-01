"use client";

import React from "react";
import { PageHeader, CategoryFilter, ProjectCard } from "@/components/shared";
import { useProjects } from "@/hooks/useProjects/useProjects";
import {
  PROJECT_STATUSES,
  PROJECTS_TEXT,
} from "@/constants/projects/projects.constant";
import { useRouter } from "next/navigation";
import { IGetProjectResponse } from "@/@types/api/project/project.interface";

const Projects: React.FC<IGetProjectResponse> = ({ data, pagination, total }) => {
  const {
    activeStatus,
    filteredProjects,
    handleStatusChange,
    handleNewProject,
    handleProjectClick,
  } = useProjects();
  const router = useRouter();
  const handleClick = () => {
    router.push("/create-project");
  };
  return (
    <div className="space-y-6">
      <PageHeader
        title={PROJECTS_TEXT.pageTitle}
        buttonText={PROJECTS_TEXT.newProjectButton}
        onButtonClick={handleClick}
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
              onClick={handleProjectClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
