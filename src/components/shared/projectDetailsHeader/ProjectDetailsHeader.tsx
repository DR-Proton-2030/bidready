import React from "react";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { IProject } from "@/@types/interface/project.interface";

interface ProjectDetailsHeaderProps {
  project: IProject;
  onBackClick: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

const ProjectDetailsHeader: React.FC<ProjectDetailsHeaderProps> = ({
  project,
  onBackClick,
  onEditClick,
  onDeleteClick,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 pt-4">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={onBackClick}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{project.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Project ID: {project._id?.slice(-8)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Edit Button */}
          {onEditClick && (
            <button
              onClick={onEditClick}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-all duration-200 border border-blue-200"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          )}
          {/* Delete Button */}
          {onDeleteClick && (
            <button
              onClick={onDeleteClick}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-all duration-200 border border-red-200"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
          {/* Status Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${project.status === "active"
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

