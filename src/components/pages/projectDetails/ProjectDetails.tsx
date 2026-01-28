"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  User,
  FileText,
  Layers,
  Grid3X3,
  List,
  Plus,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/utils/commonFunction/formatDate";
import {
  ProjectDetailsHeader,
  ProjectInfoCard,
  BlueprintsList,
  EditProjectModal,
  DeleteProjectModal,
} from "@/components/shared";
import { IProjectDetailsResponse } from "@/@types/api/project/project.interface";
import { IProject } from "@/@types/interface/project.interface";
import Link from "next/link";
import { toast } from "react-toastify";

interface ProjectDetailsProps {
  projectData: IProjectDetailsResponse;
  projectId: string;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  projectData,
  projectId,
}) => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Extract project and blueprints from the API response
  const project = projectData;
  // Transform BluePrint[] to Blueprint[] format expected by the component
  const blueprints = (projectData.blueprint_list || []).map((bp) => ({
    id: bp.name, // Use name as ID since BluePrint doesn't have id
    title: bp.name,
    category: bp.type,
    fileSize: "2.5 MB", // Default size since not in BluePrint interface
    downloadCount: 0, // Default count since not in BluePrint interface
    createdAt: new Date(), // Default date since not in BluePrint interface
  }));

  const handleBackClick = () => {
    router.back();
  };

  const handleDownloadBlueprint = (blueprintId: string) => {
    // TODO: Implement actual download functionality
    console.log(
      `Downloading blueprint ${blueprintId} for project ${projectId}`
    );
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleEditSave = async (data: Partial<IProject>) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update project");
      }
      toast.success("Project updated successfully!");
      // Refresh the page to get updated data
      router.refresh();
    } catch (error) {
      console.error("Failed to update project:", error);
      toast.error("Failed to update project");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete project");
      }
      toast.success("Project deleted successfully!");
      // Navigate back to projects list
      router.push("/projects");
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error("Failed to delete project");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 px-16 pt-10 pb-10">
      {/* Header */}
      <ProjectDetailsHeader
        project={project}
        onBackClick={handleBackClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProjectInfoCard
          icon={<Calendar className="w-5 h-5" />}
          label="Created"
          value={formatDate(project.createdAt)}
          bgColor="bg-gradient-to-br from-blue-100 to-indigo-100"
          iconColor="text-blue-600"
          gradient="bg-gradient-to-br from-blue-50/50 to-indigo-50/30"
        />
        <ProjectInfoCard
          icon={<User className="w-5 h-5" />}
          label="Created by"
          value={project.created_by_details?.full_name || project.createdBy}
          bgColor="bg-gradient-to-br from-emerald-100 to-green-100"
          iconColor="text-emerald-600"
          gradient="bg-gradient-to-br from-emerald-50/50 to-green-50/30"
        />
        <ProjectInfoCard
          icon={<FileText className="w-5 h-5" />}
          label="Status"
          value={project.status.toUpperCase()}
          bgColor="bg-gradient-to-br from-orange-100 to-amber-100"
          iconColor="text-primary"
          gradient="bg-gradient-to-br from-orange-50/50 to-amber-50/30"
        />
        <ProjectInfoCard
          icon={<Layers className="w-5 h-5" />}
          label="Total Blueprints"
          value={blueprints.length.toString()}
          bgColor="bg-gradient-to-br from-purple-100 to-violet-100"
          iconColor="text-purple-600"
          gradient="bg-gradient-to-br from-purple-50/50 to-violet-50/30"
        />
      </div>

      {/* Project Description */}
      <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden group hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300">
        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full"></div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-gradient-to-br from-primary/10 to-orange-100/50 rounded-xl">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              Project Description
            </h2>
          </div>
          <p className="text-gray-600 leading-relaxed pl-[52px]">
            {project.description}
          </p>
        </div>
      </div>

      {/* Blueprints Section */}
      <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-orange-400 to-primary/50"></div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-primary/10 to-orange-100/50 rounded-xl">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Project Blueprints
              </h2>
              <p className="text-sm text-gray-400">
                {blueprints.length} {blueprints.length === 1 ? 'blueprint' : 'blueprints'} in this project
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/projects/${projectId}/blueprints/create`}
              className="group flex items-center gap-2 bg-gradient-to-r from-primary to-orange-500 text-white pl-4 pr-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              Create Blueprint
            </Link>

            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === "grid"
                    ? "bg-white shadow-sm text-primary"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === "list"
                    ? "bg-white shadow-sm text-primary"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <BlueprintsList
          blueprints={blueprints}
          viewMode={viewMode}
          projectId={projectId}
          onDownload={handleDownloadBlueprint}
        />
      </div>

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={project}
        onSave={handleEditSave}
        isLoading={isLoading}
      />

      {/* Delete Project Modal */}
      <DeleteProjectModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        projectTitle={project.title}
        onConfirm={handleDeleteConfirm}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ProjectDetails;


