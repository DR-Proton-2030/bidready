import React from "react";
import { Download, FileText, Calendar, FolderOpen, Sparkles, ArrowRight } from "lucide-react";
import { formatDate } from "@/utils/commonFunction/formatDate";
import Link from "next/link";

interface Blueprint {
  id: string;
  title: string;
  category: string;
  fileSize: string;
  downloadCount: number;
  createdAt: Date;
}

interface BlueprintsListProps {
  blueprints: Blueprint[];
  viewMode: "grid" | "list";
  projectId: string;
  onDownload?: (blueprintId: string) => void;
}

const BlueprintsList: React.FC<BlueprintsListProps> = ({
  blueprints,
  viewMode,
  projectId,
  onDownload,
}) => {
  const handleDownload = (blueprintId: string) => {
    if (onDownload) {
      onDownload(blueprintId);
    } else {
      console.log(
        `Downloading blueprint ${blueprintId} for project ${projectId}`
      );
    }
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case "structural":
        return {
          bg: "bg-gradient-to-r from-blue-50 to-indigo-50",
          text: "text-blue-700",
          border: "border-blue-200/50",
        };
      case "electrical":
        return {
          bg: "bg-gradient-to-r from-amber-50 to-yellow-50",
          text: "text-amber-700",
          border: "border-amber-200/50",
        };
      case "plumbing":
        return {
          bg: "bg-gradient-to-r from-emerald-50 to-green-50",
          text: "text-emerald-700",
          border: "border-emerald-200/50",
        };
      case "architectural":
        return {
          bg: "bg-gradient-to-r from-purple-50 to-violet-50",
          text: "text-purple-700",
          border: "border-purple-200/50",
        };
      default:
        return {
          bg: "bg-gradient-to-r from-gray-50 to-slate-50",
          text: "text-gray-700",
          border: "border-gray-200/50",
        };
    }
  };

  if (blueprints.length === 0) {
    return (
      <div className="text-center py-16">
        {/* Animated Empty State */}
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-orange-200/30 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-full">
            <FolderOpen className="w-14 h-14 text-gray-300" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">
          No blueprints found
        </h3>
        <p className="text-gray-500 max-w-sm mx-auto mb-6">
          This project doesn&apos;t have any blueprints yet. Create your first blueprint to get started.
        </p>

        {/* Decorative elements */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <Sparkles className="w-4 h-4" />
          <span>Click &quot;Create New Blueprint&quot; to add one</span>
        </div>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-3">
        {blueprints.map((blueprint) => {
          const categoryStyle = getCategoryStyle(blueprint.category);
          return (
            <Link
              href={`/blueprints/${blueprint.id}`}
              key={blueprint.id}
              className="group flex items-center justify-between p-5 bg-gradient-to-r from-gray-50/80 to-white rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="relative p-3 bg-gradient-to-br from-primary/10 to-orange-100/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {blueprint.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryStyle.bg} ${categoryStyle.text} border ${categoryStyle.border}`}
                    >
                      {blueprint.category}
                    </span>
                    <span className="text-sm text-gray-400">
                      {blueprint.fileSize}
                    </span>
                    <span className="text-sm text-gray-400">
                      {blueprint.downloadCount} downloads
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400 hidden md:block">
                  {formatDate(blueprint.createdAt)}
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDownload(blueprint.id);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-orange-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 group-hover:scale-105"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {blueprints.map((blueprint) => {
        const categoryStyle = getCategoryStyle(blueprint.category);
        return (
          <Link
            key={blueprint.id}
            className="group relative bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-xl hover:shadow-gray-200/50 hover:border-primary/20 transition-all duration-300 overflow-hidden"
            href={`/blueprints/${blueprint.id}`}
          >
            {/* Hover gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-primary/10 to-orange-100/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryStyle.bg} ${categoryStyle.text} border ${categoryStyle.border}`}
                >
                  {blueprint.category}
                </span>
              </div>

              <h4 className="font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors text-lg">
                {blueprint.title}
              </h4>

              <div className="space-y-2.5 mb-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Size</span>
                  <span className="font-medium text-gray-700">{blueprint.fileSize}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Downloads</span>
                  <span className="font-medium text-gray-700">{blueprint.downloadCount}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(blueprint.createdAt)}</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDownload(blueprint.id);
                }}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 group-hover:scale-[1.02]"
              >
                <Download className="w-4 h-4" />
                Download Blueprint
              </button>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default BlueprintsList;

