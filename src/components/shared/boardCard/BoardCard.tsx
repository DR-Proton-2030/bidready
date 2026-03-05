"use client";
import React from "react";
import { Calendar, User, ArrowUpRight, Folder, Clock } from "lucide-react";
import { formatDate } from "@/utils/commonFunction/formatDate";
import { IProject } from "@/@types/interface/project.interface";
import { useRouter } from "next/navigation";

interface BoardCardProps extends IProject {
    isDragging?: boolean;
}

const BoardCard: React.FC<BoardCardProps> = ({
    _id,
    title,
    description,
    status,
    created_by_details,
    createdBy,
    createdAt,
    isDragging = false,
}) => {
    const router = useRouter();

    const handleViewDetails = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/project-details/${_id}`);
    };

    // Truncate description to 60 chars
    const shortDescription = description
        ? description.length > 60
            ? description.slice(0, 60) + "..."
            : description
        : "No description";

    // Priority indicator colors (could be based on actual priority field later)
    const priorityColors: Record<string, { dot: string; bg: string }> = {
        active: { dot: "bg-emerald-500", bg: "bg-emerald-500/10" },
        "in-progress": { dot: "bg-amber-500", bg: "bg-amber-500/10" },
        planning: { dot: "bg-blue-500", bg: "bg-blue-500/10" },
        completed: { dot: "bg-slate-400", bg: "bg-slate-400/10" },
    };

    const priority = priorityColors[status || "planning"] || priorityColors.planning;

    // Get initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const creatorName = created_by_details?.full_name || createdBy || "Unknown";

    return (
        <div
            className={`
        group
        shadow
        relative
        bg-white
        rounded-xl
        border border-slate-200/80
        p-7
        transition-all duration-200
        hover:border-slate-300
        hover:shadow-lg hover:shadow-slate-200/50
        ${isDragging ? "shadow-2xl shadow-orange-500/20 border-orange-300 scale-[1.02]" : ""}
      `}
        >
            {/* Priority Indicator Bar */}
            {/* <div className={`absolute top-0 left-4 right-4 h-0.5 ${priority.dot} rounded-full opacity-60`} /> */}

            {/* Header: Title + Quick Action */}
            <div className="flex items-start justify-between gap-2 mt-1">
                <h4 className="font-semibold text-slate-800 text-sm leading-tight line-clamp-2 flex-1">
                    {title}
                </h4>
                <button
                    onClick={handleViewDetails}
                    className="
            opacity-0 group-hover:opacity-100
            p-1.5
            rounded-lg
            bg-slate-100 hover:bg-orange-500
            text-slate-500 hover:text-white
            transition-all duration-200
            flex-shrink-0
          "
                    title="View Details"
                >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                {shortDescription}
            </p>

            {/* Tags/Meta Row */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className={`
          inline-flex items-center gap-1
          px-2 py-0.5
          rounded-full
          text-[10px] font-medium
          ${priority.bg}
          text-slate-600
        `}>
                    <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                    {status?.charAt(0).toUpperCase() + status?.slice(1).replace("-", " ") || "Planning"}
                </span>

                <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                    <Folder className="w-3 h-3" />
                    {_id?.slice(-6)}
                </span>
            </div>

            {/* Footer: Creator + Date */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                {/* Creator Avatar + Name */}
                <div className="flex items-center gap-2">
                    {created_by_details?.profile_picture ? (
                        <img
                            src={created_by_details.profile_picture}
                            alt={creatorName}
                            className="w-6 h-6 rounded-full object-cover ring-2 ring-white"
                        />
                    ) : (
                        <div className="
              w-6 h-6
              rounded-full
              bg-gradient-to-br from-orange-400 to-orange-600
              flex items-center justify-center
              text-[10px] font-semibold text-white
              ring-2 ring-white
            ">
                            {getInitials(creatorName)}
                        </div>
                    )}
                    <span className="text-xs text-slate-600 font-medium truncate max-w-[80px]">
                        {creatorName.split(" ")[0]}
                    </span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(createdAt)}</span>
                </div>
            </div>
        </div>
    );
};

export default BoardCard;
