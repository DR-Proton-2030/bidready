"use client";
import React from "react";
import { File, ChevronDown, Share2, PanelLeft } from "lucide-react";

interface TopBarProps {
  onToggleRightPanel: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onToggleRightPanel }) => {
  return (
    <header className="flex-shrink-0 flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-gray-800">My Project</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500 cursor-pointer">
          <File className="w-4 h-4" />
          <span>First Floor Plan</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200">
          <Share2 className="w-5 h-5" />
        </button>
        <button
          onClick={onToggleRightPanel}
          className="p-2 text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          <PanelLeft className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
