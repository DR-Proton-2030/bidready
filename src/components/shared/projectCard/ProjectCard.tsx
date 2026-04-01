"use client";
import React from "react";
import { Calendar, FolderClosed } from "lucide-react";
import { formatDate } from "@/utils/commonFunction/formatDate";
import { IProject } from "@/@types/interface/project.interface";
import { useRouter } from "next/navigation";

const ProjectCard: React.FC<IProject> = ({
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

  const shortDescription = (() => {
    if (!description) return "";
    const words = description.split(/\s+/).filter(Boolean);
    return words.length > 20
      ? words.slice(0, 20).join(" ") + "..."
      : description;
  })();

  const statusColors: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    "in-progress": "bg-orange-100 text-orange-700",
    completed: "bg-blue-100 text-blue-700",
    "on-hold": "bg-amber-100 text-amber-700",
    default: "bg-gray-100 text-gray-700",
  };

  return (
    <div
      className="
      cursor-pointer
      max-w-md
      w-full
      rounded-2xl
     border-2 border-white/80 bg-white/50 backdrop-blur-xl
      shadow-md
      transition-shadow
      p-5 sm:p-6
    "
      onClick={handleCardClick}
    >
      {/* Top Row */}
      <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
        <div
          className="
         p-3
          rounded-2xl
          flex items-center justify-center
        "
          style={{
            background: "linear-gradient(180deg,#ff8a33,#ff6a00)",
          }}
        >
          <FolderClosed className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>

        <span
          className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
            statusColors[status] || statusColors.default
          }`}
        >
          {status?.toUpperCase() || "N/A"}
        </span>
      </div>

      {/* Project ID */}
      <div className="text-xs text-gray-400 font-mono mb-3 truncate">
        <span className="font-semibold text-gray-500">ID:</span>{" "}
        {_id?.slice(-8) || "N/A"}
      </div>

      {/* Title */}
      <h3 className="text-gray-900 font-semibold text-base sm:text-lg mb-2 line-clamp-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-3">
        {shortDescription}
      </p>

      {/* Creator Info */}
      <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 mb-4">
        <span className="font-medium">Created by:</span>
        <span className="text-gray-800 font-medium truncate max-w-[150px] sm:max-w-none">
          {created_by_details?.full_name || createdBy || "Unknown"}
        </span>
      </div>

      <hr className="border-gray-200/30 mb-4" />

      {/* Bottom Row */}
      <div className="flex flex-wrap gap-3 items-center justify-between text-xs sm:text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
          <span>{formatDate(createdAt)}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className="
            bg-orange-500 hover:bg-orange-600
            text-white
            px-4 sm:px-6 py-2 sm:py-3
            rounded-full
            font-medium
            text-xs sm:text-sm
            transition-colors
          "
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
