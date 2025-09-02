import React from "react";
import { ArrowLeft } from "lucide-react";
import { IProject } from "@/@types/interface/project.interface";

interface ProjectDetailsHeaderProps {
  project: IProject;
  onBackClick: () => void;
}

const ProjectDetailsHeader: React.FC<ProjectDetailsHeaderProps> = ({ 
  project, 
  onBackClick 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={onBackClick}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
          <p className="text-sm text-gray-500 mt-1">Project ID: {project._id?.slice(-8)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              project.status === "active"
                ? "bg-emerald-100 text-emerald-700"
                : project.status === "in-progress"
                ? "bg-orange-100 text-orange-700"
                : project.status === "completed"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {project.status.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsHeader;
