"use client"
import React from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  FolderClosed,
} from "lucide-react";
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
  }
  return (
    <motion.div 
      className="group relative bg-white rounded-2xl border border-gray-200/60 shadow-md hover:shadow-xl transition-all duration-300 p-6 max-w-md cursor-pointer"
      whileHover={{ 
        y: -4,
        scale: 1.01,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
    >
      {/* Top Section */}
      <div className="relative flex justify-between items-center mb-4">
        {/* Clean Logo */}
        <div className="w-12 h-12 orange-gradient rounded-xl shadow-sm flex items-center justify-center">
          <FolderClosed className="w-6 h-6 text-white" />
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold
      ${
        status === "active"
          ? "bg-emerald-100 text-emerald-700"
          : status === "in-progress"
          ? "bg-orange-100 text-orange-700"
          : status === "completed"
          ? "bg-blue-100 text-blue-700"
          : "bg-gray-100 text-gray-700"
      }`}
          >
            {status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Project ID - Clean Style */}
      <div className="relative text-xs text-gray-400 mb-4 font-mono">
        <span className="text-gray-500 font-semibold">ID:</span> {_id?.slice(-8) || "N/A"}
      </div>

      {/* Title - Clean Typography */}
      <h3 className="relative text-gray-900 font-semibold text-lg leading-tight mb-3">
        {title}
      </h3>

      {/* Description - Clean */}
      <p className="relative text-gray-600 text-sm leading-relaxed mb-4">
        {description}
      </p>

      {/* Info Grid - Clean Layout */}
      <div className="relative mb-4">
        {/* Creator */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Created by:</span> 
          <span className="text-primary font-medium">{created_by_details?.full_name || createdBy || "Unknown"}</span>
        </div>
      </div>

      {/* Clean Divider */}
      <hr className="my-4 border-gray-200" />

      {/* Bottom Section - Clean */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-primary" />
          <span>{formatDate(createdAt)}</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCardClick}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200"
        >
          View Details
        </motion.button>
      </div>
    </motion.div>
  );
};
export default ProjectCard;
