"use client";
import React from "react";
import { DocumentText, DownloadMinimalistic, Calendar, Gallery, Folder2 } from "@solar-icons/react";
import Link from "next/link";
import { BluePrint } from "@/@types/interface/blueprint.interface";
import { formatDate } from "@/utils/commonFunction/formatDate";

const statusConfig: Record<string, { bg: string; dot: string; text: string; label: string }> = {
  active:       { bg: "bg-emerald-50",  dot: "bg-emerald-400", text: "text-emerald-700", label: "Active" },
  "in-progress":{ bg: "bg-amber-50",   dot: "bg-amber-400",   text: "text-amber-700",  label: "In Progress" },
  completed:    { bg: "bg-sky-50",     dot: "bg-sky-400",     text: "text-sky-700",    label: "Completed" },
  draft:        { bg: "bg-slate-50",   dot: "bg-slate-400",   text: "text-slate-600",  label: "Draft" },
  default:      { bg: "bg-gray-50",    dot: "bg-gray-400",    text: "text-gray-600",   label: "Unknown" },
};

const BlueprintCard: React.FC<BluePrint> = ({
  _id,
  name,
  description,
  type,
  status,
  version,
  updatedAt,
  createdAt,
  file_url,
  image_count,
  project_object_id,
}) => {
  const s = statusConfig[status ?? "default"] ?? statusConfig.default;

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!file_url) return;
    try {
      const response = await fetch(file_url);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file_url.split("/").pop() || `${name}.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed, opening in new tab:", error);
      window.open(file_url, "_blank");
    }
  };

  return (
    <Link
      href={`/blueprints/${_id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-orange-200"
    >
      {/* Accent bar */}
      {/* <div className="h-1 w-full bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400" /> */}

      <div className="flex flex-col flex-1 p-5">

        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          {/* Icon */}
          <div
            className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl shadow-sm"
            style={{ background: "linear-gradient(135deg,#ff8a33,#ff5c00)" }}
          >
            <DocumentText size={20} weight="Bold" className="text-white" />
          </div>

          {/* Status + Type stacked */}
          <div className="flex flex-col items-end gap-1.5 min-w-0">
            {status && (
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${s.bg} ${s.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                {s.label}
              </span>
            )}
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {type}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="mb-1.5 text-base font-bold leading-snug text-slate-900 line-clamp-2 group-hover:text-orange-600 transition-colors duration-200">
          {name}
        </h3>

        {/* Description */}
        <p className="mb-4 text-sm leading-relaxed text-slate-400 line-clamp-2 flex-1">
          {description}
        </p>

        {/* Chips row */}
        {(project_object_id || typeof image_count === "number") && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project_object_id && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600 ring-1 ring-blue-100">
                <Folder2 size={11} weight="Bold" />
                {project_object_id.slice(-6)}
              </span>
            )}
            {typeof image_count === "number" && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-600 ring-1 ring-violet-100">
                <Gallery size={11} weight="Bold" />
                {image_count} {image_count === 1 ? "page" : "pages"}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Calendar size={13} weight="Linear" />
            <span className="text-[11px] font-medium">
              {updatedAt ? formatDate(updatedAt) : createdAt ? formatDate(createdAt) : "N/A"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
              v{version}
            </span>
            <button
              onClick={handleDownload}
              className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-400 transition-all duration-200 hover:bg-orange-500 hover:text-white"
              aria-label={`Download ${name}`}
            >
              <DownloadMinimalistic size={13} weight="Bold" />
            </button>
          </div>
        </div>

      </div>
    </Link>
  );
};

export default BlueprintCard;