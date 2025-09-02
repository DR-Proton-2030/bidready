"use client";
import React from "react";
import { Printer, FileText } from "lucide-react";

interface RightPanelProps {
  isOpen: boolean;
}

const RightPanel: React.FC<RightPanelProps> = ({ isOpen }) => {
  return (
    <aside
      className={`flex-shrink-0 bg-white border-l border-gray-200 transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? "w-80" : "w-0 border-l-0"
      }`}
    >
      <div className="w-80 flex flex-col h-full">
        <div className="flex-shrink-0 flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Quantities</h2>
          <div className="flex space-x-2">
            <button className="p-2 text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200">
              <Printer className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200">
              <FileText className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <p className="font-semibold text-gray-700">Walls</p>
              <p className="text-sm text-gray-500">1,250 sq ft</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <p className="font-semibold text-gray-700">Doors</p>
              <p className="text-sm text-gray-500">12 units</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <p className="font-semibold text-gray-700">Windows</p>
              <p className="text-sm text-gray-500">15 units</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightPanel;
