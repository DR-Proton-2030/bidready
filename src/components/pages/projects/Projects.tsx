"use client";

import React, { useState } from "react";
import { PageHeader, ProjectCard, ProjectListItem } from "@/components/shared";
import { Magnifer, WidgetAdd, ListCheck, SortVertical, Folder2, AddSquare } from "@solar-icons/react";
import {
  PROJECT_STATUSES,
  PROJECTS_TEXT,
} from "@/constants/projects/projects.constant";
import { IGetProjectResponse } from "@/@types/api/project/project.interface";
import ProjectKanbanBoard from "./ProjectKanbanBoard";
import Link from "next/link";

const Projects: React.FC<IGetProjectResponse> = ({
  data,
  pagination,
  total,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'board'>('board');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = data?.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 px-16 pt-10  bg-gradient-to-br from-slate-100 to-slate-200 min-h-[calc(100vh-64px)]">
   

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between rounded-2xl border border-white/60 bg-white/70 p-2.5 shadow-sm backdrop-blur-xl">
        {/* Search + Create */}
        <div className="flex w-full items-center gap-2 md:max-w-lg">
          <div className="relative flex-1">
            <Magnifer size={18} weight="Linear" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200/60 bg-white/60 py-2.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-orange-300/60 focus:ring-2 focus:ring-orange-200/30"
            />
          </div>
         
        </div>

      <div className="flex items-center gap-2">
          {/* View Toggle */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200/60 bg-white/60 p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded-lg p-2 transition-all duration-200 ${viewMode === 'grid'
              ? 'bg-white text-orange-500 shadow-sm ring-1 ring-black/5'
              : 'text-slate-400 hover:bg-white/50 hover:text-slate-600'
              }`}
            title="Grid View"
          >
            <WidgetAdd size={18} weight={viewMode === 'grid' ? 'Bold' : 'Linear'} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`rounded-lg p-2 transition-all duration-200 ${viewMode === 'list'
              ? 'bg-white text-orange-500 shadow-sm ring-1 ring-black/5'
              : 'text-slate-400 hover:bg-white/50 hover:text-slate-600'
              }`}
            title="List View"
          >
            <ListCheck size={18} weight={viewMode === 'list' ? 'Bold' : 'Linear'} />
          </button>
          <button
            onClick={() => setViewMode('board')}
            className={`rounded-lg p-2 transition-all duration-200 ${viewMode === 'board'
              ? 'bg-white text-orange-500 shadow-sm ring-1 ring-black/5'
              : 'text-slate-400 hover:bg-white/50 hover:text-slate-600'
              }`}
            title="Board View"
          >
            <SortVertical size={18} weight={viewMode === 'board' ? 'Bold' : 'Linear'} />
          </button>
        </div>
         <Link
            href="/create-project"
            className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-orange-600 hover:to-orange-700 hover:shadow-md"
          >
            <AddSquare size={18} weight="Bold" />
            <span className="hidden sm:inline">{PROJECTS_TEXT.newProjectButton}</span>
          </Link>
      </div>
      </div>

      <div className="min-h-[400px]">
        {
          filteredProjects?.length === 0 && (
            <div className="text-center py-20 col-span-full bg-white/30 rounded-3xl border border-white/50 backdrop-blur-sm">
              <Folder2 size={64} weight="Linear" className="text-gray-300 mx-auto mb-4" />
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

        {filteredProjects?.length > 0 && (
          <>
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project._id}
                    {...project}
                  />
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="flex flex-col gap-4">
                {filteredProjects.map((project) => (
                  <ProjectListItem key={project._id} {...project} />
                ))}
              </div>
            )}

            {viewMode === 'board' && (
              <ProjectKanbanBoard projects={filteredProjects} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Projects;
