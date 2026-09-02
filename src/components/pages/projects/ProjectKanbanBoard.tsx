"use client";

import React, { useEffect, useState } from "react";
import { IProject } from "@/@types/interface/project.interface";
import { BoardCard } from "@/components/shared";

interface ProjectKanbanBoardProps {
    projects: IProject[];
}

// Projects are shown as a single clean, responsive grid of cards. The previous
// status-based Kanban (Active / In Progress / Completed / On Hold) added empty
// columns and drag-to-reassign that aren't used, so it's been simplified to a
// straightforward board of all projects.
const ProjectKanbanBoard: React.FC<ProjectKanbanBoardProps> = ({
    projects: initialProjects,
}) => {
    const [projects, setProjects] = useState<IProject[]>(initialProjects);

    useEffect(() => {
        setProjects(initialProjects);
    }, [initialProjects]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-6 items-start">
            {projects.map((project) => (
                <BoardCard key={project._id} {...project} />
            ))}
        </div>
    );
};

export default ProjectKanbanBoard;
