"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  User,
  FileText,
  Download,
  Grid3X3,
  List,
  Plus,
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
    <div className="space-y-6 px-16 pt-10">
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
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <ProjectInfoCard
          icon={<User className="w-5 h-5" />}
          label="Created by"
          value={project.created_by_details?.full_name || project.createdBy}
          bgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <ProjectInfoCard
          icon={<FileText className="w-5 h-5" />}
          label="Status"
          value={project.status.toUpperCase()}
          bgColor="bg-orange-50"
          iconColor="text-primary"
        />
        <ProjectInfoCard
          icon={<Download className="w-5 h-5" />}
          label="Total Blueprints"
          value={blueprints.length.toString()}
          bgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* Project Description */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Project Description
        </h2>
        <p className="text-gray-600 leading-relaxed">{project.description}</p>
      </div>

      {/* Blueprints Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Project Blueprints
          </h2>
          <div className="flex items-center gap-2">
            <Link
              href={`/projects/${projectId}/blueprints/create`}
              className="bg-primary cursor-pointer flex gap-2 items-center text-white pl-3 pr-5 py-2 rounded-lg font-medium"
            >
              <Plus className="w-5 h-5" />
              Create New Blueprint
            </Link>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "grid"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "list"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              <List className="w-4 h-4" />
            </button>
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

