import React from "react";
import { Download, FileText, Calendar } from "lucide-react";
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
      // Default download behavior
      console.log(
        `Downloading blueprint ${blueprintId} for project ${projectId}`
      );
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "structural":
        return "bg-blue-100 text-blue-700";
      case "electrical":
        return "bg-yellow-100 text-yellow-700";
      case "plumbing":
        return "bg-green-100 text-green-700";
      case "architectural":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (blueprints.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No blueprints found
        </h3>
        <p className="text-gray-600">
          This project doesn&apos;t have any blueprints yet.
        </p>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-3">
        {blueprints.map((blueprint) => (
          <Link
            href={`/blueprints/${blueprint.id}`}
            key={blueprint.id}
            className="flex items-center  justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{blueprint.title}</h4>
                <div className="flex items-center gap-4 mt-1">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(
                      blueprint.category
                    )}`}
                  >
                    {blueprint.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    {blueprint.fileSize}
                  </span>
                  <span className="text-sm text-gray-500">
                    {blueprint.downloadCount} downloads
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {formatDate(blueprint.createdAt)}
              </span>

              <button
                onClick={() => handleDownload(blueprint.id)}
                className="w-full bg-primary hover:bg-primary-hover text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {blueprints.map((blueprint) => (
        <Link
          key={blueprint.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          href={`/blueprints/${blueprint.id}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(
                blueprint.category
              )}`}
            >
              {blueprint.category}
            </span>
          </div>

          <h4 className="font-medium text-gray-900 mb-2">{blueprint.title}</h4>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Size:</span>
              <span>{blueprint.fileSize}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Downloads:</span>
              <span>{blueprint.downloadCount}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(blueprint.createdAt)}</span>
            </div>
          </div>

          <button
            onClick={() => handleDownload(blueprint.id)}
            className="w-full bg-primary hover:bg-primary-hover text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </Link>
      ))}
    </div>
  );
};

export default BlueprintsList;
