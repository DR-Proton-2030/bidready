"use client";
import React from "react";
import { Printer, FileText } from "lucide-react";
import RightPanelImageCard from "./RightPanelImageCard";

interface RightPanelProps {
  isOpen: boolean;
  images?: Array<{ id: string; src?: string; alt?: string }>;
}

const RightPanel: React.FC<RightPanelProps> = ({ isOpen, images = [] }) => {
  // sample placeholders when images array is empty
  const placeholders = Array.from({ length: 4 }).map((_, i) => ({ id: `ph-${i}`, src: undefined as string | undefined, alt: undefined as string | undefined }));

  const list = images.length ? images : placeholders;

  const handleDownload = (id: string) => {
    // implement download logic or emit event
    console.log("download", id);
  };

  const handleDelete = (id: string) => {
    // implement delete logic or emit event
    console.log("delete", id);
  };

  const handleExpand = (id: string) => {
    console.log("expand", id);
  };

  const handleGroup = (id: string) => {
    console.log("group", id);
  };

  return (
    <aside
      className={`flex-shrink-0 bg-white border-l border-gray-200 transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? "w-80" : "w-0 border-l-0"
      }`}
    >
      <div className="w-80 flex flex-col h-full">
        <div className="flex-shrink-0 flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Floor Prints</h2>
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
            {list.map((it) => (
              <RightPanelImageCard
                key={it.id}
                src={"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Sample_Floorplan.jpg/330px-Sample_Floorplan.jpg"}
                alt={it.alt}
                onExpand={() => handleExpand(it.id)}
                onGroup={() => handleGroup(it.id)}
                onDownload={() => handleDownload(it.id)}
                onDelete={() => handleDelete(it.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightPanel;
