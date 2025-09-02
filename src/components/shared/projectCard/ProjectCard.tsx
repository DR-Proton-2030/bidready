/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Calendar,
  Users,
  Link2,
  ArrowUpLeft,
  ArrowUpRight,
  Folder,
  FolderClosed,
} from "lucide-react";

const EventCard: React.FC<any> = ({
  title,
  description,
  status,
  createdAt,
}) => {
  return (
    <motion.div className="bg-white rounded-2xl border border-gray-200 w-[33%] p-6 w-full max-w-md cursor-pointer">
      {/* Top Section */}
      <div className="flex justify-between items-center mb-4">
        {/* Logo */}
        <div className="w-12 h-12 border border-gray-300 rounded-xl overflow-hidden bg-gray-100 items-center justify-center flex">
          <FolderClosed className="w-7 h-7 text-gray-500" />
        </div>

        {/* Time */}
        <div className="flex items-center pr-2 gap-2 text-sm font-medium">
          <span
            className={`px-4 py-2 rounded-xl text-xs font-semibold
      ${
        status === "Active"
          ? "bg-green-100 text-green-700"
          : status === "In Progress"
          ? "bg-yellow-100 text-yellow-700"
          : "bg-gray-100 text-gray-700"
      }`}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-gray-800 h-10 w-[90%] font-semibold text-md 2xl:text-lg leading-snug mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-500 text-xs 2xl:text-sm mt-5 mb-4">
        {description}
      </p>

      {/* Divider */}
      <hr className="my-4 border-gray-200" />

      {/* Bottom Section */}
      <div className="flex items-center justify-between">
        <span className="text-xs 2xl:text-sm flex items-center gap-2 text-gray-600 font-medium">
          <Calendar className="w-5 h-5" /> {createdAt}
        </span>

        <motion.button
          whileHover={{
            scale: 1.02,
            backgroundColor: "#ed8c43ff",
            color: "#fff",
          }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-full border border-gray-200 transition"
        >
          View Details
          <ArrowUpRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default EventCard;
