"use client";
import React from "react";
import { FileImage, FileText } from "lucide-react";

interface ViewModeSwitcherProps {
  currentMode: "images" | "pdf";
  hasPDF: boolean;
  hasImages: boolean;
  onModeChange: (mode: "images" | "pdf") => void;
}

const ViewModeSwitcher: React.FC<ViewModeSwitcherProps> = ({
  currentMode,
  hasPDF,
  hasImages,
  onModeChange,
}) => {
  // Don't show switcher if only one mode is available
  if (!hasPDF && !hasImages) return null;
  if (!hasPDF || !hasImages) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">View Mode</h3>
          <p className="text-xs text-gray-500 mt-1">
            Choose how you want to work with your blueprints
          </p>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
          <button
            onClick={() => onModeChange("images")}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
              currentMode === "images"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileImage className="w-4 h-4 mr-2" />
            Image Detection
          </button>
          <button
            onClick={() => onModeChange("pdf")}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
              currentMode === "pdf"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText className="w-4 h-4 mr-2" />
            PDF Annotation
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewModeSwitcher;
