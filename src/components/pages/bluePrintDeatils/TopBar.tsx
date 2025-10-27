/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { File, ChevronDown, Share2, PanelLeft } from "lucide-react";

interface TopBarProps {
  onToggleRightPanel: () => void;
  blueprintDetails?: any;
}

const TopBar: React.FC<TopBarProps> = ({
  onToggleRightPanel,
  blueprintDetails,
}) => {
  return (
    <header className="flex-shrink-0 flex items-center justify-between  px-16 py-3 bg-white mb-5">
      <div className="flex items-center space-x-4">
        <div>
        <h1 className="text-3xl font-semibold text-gray-900 pt-5">{blueprintDetails?.name || "Untitled Blueprint"}</h1>
        <p className="text-gray-500">Plan, prioritize, and accomplish your tasks with ease.</p>
      </div>
        {/* <h1 className="text-xl font-semibold text-gray-800">
          {blueprintDetails?.name || "Untitled Blueprint"}
        </h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500 cursor-pointer">
          <File className="w-4 h-4" />
          <span>{blueprintDetails?.type || "No type"}</span>
          <ChevronDown className="w-4 h-4" />
        </div> */}
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
