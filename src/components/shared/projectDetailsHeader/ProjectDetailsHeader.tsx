import React from "react";
import { ArrowLeft, Pencil, Trash2, MoreHorizontal } from "lucide-react";
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-4">
        {/* Back Button */}
        <button
          onClick={onBackClick}
          className="p-2.5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-200 shadow-sm hover:shadow border border-gray-200/50"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>

        {/* Project Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
              {project.title}
            </h1>
            {/* Status Badge - Inline with title */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${project.status === "active"
                  ? "bg-gradient-to-r from-emerald-400 to-emerald-500 text-white"
                  : project.status === "in-progress"
                    ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white"
                    : project.status === "completed"
                      ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white"
                      : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                }`}
            >
              {project.status.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1 font-mono">
            ID: {project._id?.slice(-8)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Edit Button */}
          {onEditClick && (
            <button
              onClick={onEditClick}
              className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700 rounded-xl font-medium hover:from-primary/10 hover:to-primary/5 hover:text-primary transition-all duration-300 border border-slate-200/80 hover:border-primary/30 shadow-sm hover:shadow"
            >
              <Pencil className="w-4 h-4 transition-transform group-hover:rotate-12" />
              <span>Edit</span>
            </button>
          )}

          {/* Delete Button */}
          {onDeleteClick && (
            <button
              onClick={onDeleteClick}
              className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-red-50 to-rose-50 text-red-600 rounded-xl font-medium hover:from-red-100 hover:to-rose-100 transition-all duration-300 border border-red-200/80 hover:border-red-300 shadow-sm hover:shadow"
            >
              <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsHeader;
