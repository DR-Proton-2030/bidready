"use client";

import React, { useState } from "react";
import { PageHeader, ProjectCard, ProjectListItem } from "@/components/shared";
import { Search, LayoutGrid, List, FolderClosed } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = data?.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 px-16 pt-10  bg-gradient-to-br from-slate-100 to-slate-200 min-h-[calc(100vh-64px)]">
      <PageHeader
        title={PROJECTS_TEXT.pageTitle}
        buttonText={PROJECTS_TEXT.newProjectButton}
        link="/create-project"
      />

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm bg-gray-100 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
        {/* Search Bar */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/60 bg-white/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-gray-400 text-gray-700"
          />
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-white/60 p-1 rounded-xl border border-white/60">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === 'grid'
              ? 'bg-white shadow-sm text-primary ring-1 ring-black/5'
              : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
              }`}
            title="Grid View"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === 'list'
              ? 'bg-white shadow-sm text-primary ring-1 ring-black/5'
              : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
              }`}
            title="List View"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
        {
          filteredProjects?.length === 0 && (
            <div className="text-center py-20 col-span-full bg-white/30 rounded-3xl border border-white/50 backdrop-blur-sm">
              <FolderClosed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-500">No projects found matching &quot;{searchQuery}&quot;</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-primary hover:underline text-sm font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          )
        }
        {filteredProjects.map((project) => (
          viewMode === 'grid' ? (
            <ProjectCard
              key={project._id}
              {...project}
            />
          ) : (
            <ProjectListItem key={project._id} {...project} />
          )
        ))}
      </div>
    </div>
  );
};

export default Projects;
