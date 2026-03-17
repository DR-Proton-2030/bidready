"use client";
import React from "react";
import { Calendar, FolderClosed, ChevronRight } from "lucide-react";
import { formatDate } from "@/utils/commonFunction/formatDate";
import { IProject } from "@/@types/interface/project.interface";
import { useRouter } from "next/navigation";

const ProjectListItem: React.FC<IProject> = ({
  _id,
  title,
  description,
  status,
  createdBy,
  created_by_details,
  createdAt,
}) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/project-details/${_id}`);
  };

  const statusColors: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-600 border-emerald-100",
    "in-progress": "bg-orange-50 text-orange-600 border-orange-100",
    completed: "bg-blue-50 text-blue-600 border-blue-100",
    planning: "bg-purple-50 text-purple-600 border-purple-100",
    default: "bg-gray-50 text-gray-600 border-gray-100",
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 rounded-2xl border-2 border-white/80 bg-white/50 backdrop-blur-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:bg-white/80 cursor-pointer"
    >
      <div className="flex items-start sm:items-center gap-4 w-full sm:flex-1 min-w-0">
        <div
          className="p-3 rounded-xl shadow-inner shrink-0"
          style={{
            background: "linear-gradient(180deg,#ff8a33,#ff6a00)",
          }}
        >
          <FolderClosed className="w-6 h-6 text-white" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h3 className="text-base sm:text-lg font-semibold text-slate-700 truncate max-w-[200px] sm:max-w-md">
              {title}
            </h3>
            <span
              className={`inline-flex px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${statusColors[status] || statusColors.default}`}
            >
              {status}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-400 mt-1">
            <span className="font-mono">ID: {_id?.slice(-8)}</span>
            <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="truncate max-w-[200px] sm:max-w-xs">
              {description}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8 shrink-0 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-slate-100 mt-2 sm:mt-0">
        <div className="flex flex-col items-start sm:items-end gap-1">
          <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
            <span>By:</span>
            <span className="text-slate-700 truncate max-w-[120px] sm:max-w-none">
              {created_by_details?.full_name || createdBy || "Unknown"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block w-px h-8 bg-slate-200" />

          <button className="px-4 py-2 bg-white text-orange-500 hover:bg-orange-50 rounded-xl transition-colors border border-orange-200 text-sm font-medium group-hover:border-orange-500 group-hover:bg-orange-500 group-hover:text-white">
            View
          </button>

          <div className="hidden sm:block p-2 text-primary/40 group-hover:text-primary transition-colors">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectListItem;
