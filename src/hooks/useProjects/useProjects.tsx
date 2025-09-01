"use client";

import { useState, useMemo } from "react";
import { Project } from "@/@types/interface/project.interface";
import {
  PROJECTS_DATA,
  PROJECTS_TEXT,
} from "@/constants/projects/projects.constant";

export const useProjects = () => {
  const [activeStatus, setActiveStatus] = useState<string>("All");

  const filteredProjects = useMemo(() => {
    return activeStatus === "All"
      ? PROJECTS_DATA
      : PROJECTS_DATA.filter((project) => project.status === activeStatus);
  }, [activeStatus]);

  const handleStatusChange = (status: string) => {
    setActiveStatus(status);
  };

  const handleNewProject = async (payload: object) => {
    try {
      // call server API route which runs server-side and proxies to backend using cookie token
      const result = await createProjectServer(payload);
      return result;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create project";
      throw new Error(message);
    }
  };

  const createProjectServer = async (payload: object) => {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create project");
      }
      return await res.json();
    } catch (err) {
      throw err;
    }
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
    createProjectServer,
    handleProjectClick,
  };
};
