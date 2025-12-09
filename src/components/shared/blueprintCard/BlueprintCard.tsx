"use client";
import React from "react";
import { FileText, Clock, Download, Calendar, Calendar1Icon, Map } from "lucide-react";
import Link from "next/link";
import { BluePrint } from "@/@types/interface/blueprint.interface";
import { formatDate } from "@/utils/commonFunction/formatDate";

const BlueprintCard: React.FC<BluePrint> = ({
  _id,
  name,
  description,
  type,
  version,
  updatedAt,
  file_url
}) => {
  return (
    <Link
      href={`/blueprints/${_id}`}
      className="group relative flex flex-col rounded-3xl border-2 border-white/80 bg-white/50 backdrop-blur-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      {/* Decorative gradient ring */}
      {/* <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-200/20 to-[#4A5565]/20 opacity-0 group-hover:opacity-100 transition duration-300" /> */}

      <div className="relative z-10 flex items-start justify-between mb-5">
        {/* Icon + Title */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl  shadow-inner" style={{
            background: "linear-gradient(180deg,#ff8a33,#ff6a00)",
          }}>
            <Map className="w-7 h-7 text-orange-100" />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-[#4A5565] leading-tight">
              {name}
            </h3>
            <span className="mt-1  -ml-1 inline-block px-3 py-1 text-xs font-semibold bg-gray-200 text-[#4A5565] rounded-full border border-gray-300">
              {type}
            </span>
          </div>
        </div>

        {/* Download button */}
        <button
          className="p-2  hover:bg-gray-100 border border-gray-300 bg-white rounded-full text-gray-500 hover:text-[#4A5565]/80 transition"
          aria-label={`Download ${name}`}
        >

          <Download className="w-5 h-5" />
        </button>
      </div>

      {/* Description */}
      <p className="relative z-10 text-gray-700 text-sm leading-relaxed line-clamp-3 mb-5">
        {description}
      </p>

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-between text-sm text-gray-500 mt-auto pt-3 border-t border-[#4A5565]/10">
        <div className="flex items-center gap-2">
          <Calendar1Icon className="w-4 h-4" />
          <span>{updatedAt ? formatDate(updatedAt) : "N/A"}</span>
        </div>
        <span className="font-semibold text-[#4A5565]">v{version}</span>
      </div>
    </Link>
  );
};

export default BlueprintCard;
