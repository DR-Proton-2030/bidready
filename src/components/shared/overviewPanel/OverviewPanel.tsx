"use client";
import React from "react";
import { BlueprintImage } from "../../../hooks/useBlueprintImages";

interface Props {
  selected: BlueprintImage | null;
  isDragOver: boolean;
  setIsDragOver: (v: boolean) => void;
  toggleSelect: (id: string) => void;
  selectedIds: Set<string>;
  handleDelete: (id: string) => void;
  onSelectImage?: (id: string) => void;
  onDetect?: (imageUrl: string) => void;
}

const OverviewPanel: React.FC<Props> = ({
  selected,
  isDragOver,
  setIsDragOver,
  toggleSelect,
  selectedIds,
  handleDelete,
  onSelectImage,
  onDetect,
}) => {
  return (
    <div
      className={`w-[35%] border-l-2 border-gray-200 bg-white transition-colors ${
        isDragOver ? "bg-blue-50" : "bg-white"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const id = e.dataTransfer?.getData("text/plain");
        if (!id) return;
        onSelectImage?.(id);
      }}
    >
      {selected ? (
        <div className="h-full p-4 flex flex-col">
          <h3 className="text-base font-semibold mb-3">Preview</h3>
          <div className="flex-1 overflow-auto rounded-lg border-2 border-gray-200">
            <img src={selected.url ?? ""} alt="" className="w-full h-full object-contain" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <button
              className="py-2 bg-blue-600 rounded text-white font-medium hover:bg-blue-700"
              onClick={() => toggleSelect(selected.id)}
            >
              {selectedIds.has(selected.id) ? "Unselect" : "Select"}
            </button>
            {selected?.url && (
              <button
                className="py-2 bg-indigo-600 rounded text-white font-medium hover:bg-indigo-700"
                onClick={() => onDetect?.(selected.url ?? "")}
                title="Run detection on this image"
              >
                Detect
              </button>
            )}
            <button
              className="py-2 rounded text-white font-medium bg-red-600 hover:bg-red-700"
              onClick={() => handleDelete(selected.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
          Drop an image here to preview
        </div>
      )}
    </div>
  );
};

export default OverviewPanel;
