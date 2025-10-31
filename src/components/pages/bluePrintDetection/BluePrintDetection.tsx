"use client";
import React, { useState } from "react";
import useBlueprintImages from "../../../hooks/useBlueprintImages";

const BluePrintDetection: React.FC<{ id?: string }> = ({ id: propId }) => {
  const { images, loading, error } = useBlueprintImages(propId ?? null);
  const [selected, setSelected] = useState<any>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDelete = (id: string) => {
    console.log("Delete image", id);
  };

  return (
    <div className="flex h-[92vh]  overflow-hidden bg-gray-50">
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Blueprint Images</h2>
        </div>

        {loading && <div>Loading images...</div>}
        {error && <div className="text-sm text-red-500">{error}</div>}
        {!loading && !error && images.length === 0 && (
          <div className="text-sm text-gray-500">No images found.</div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              draggable
              onDragStart={(e) => {
                try {
                  e.dataTransfer?.setData("text/plain", img.id);
                } catch (err) {
                  /* ignore */
                }
              }}
              className={`relative rounded-lg overflow-hidden bg-white shadow-sm cursor-pointer transition hover:scale-[1.02] ${
                selected?.id === img.id ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setSelected(img)}
            >
              <img
                src={img!.url ?? ""}
                alt=""
                className="w-full h-40 object-cover"
              />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(img.id);
                }}
                className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
      <div
        className={`w-[35%] border-l bg-white transition-colors ${
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
          const found = images.find((it) => it.id === id);
          if (found) setSelected(found);
        }}
      >
        {selected ? (
          <div className="h-full p-4 flex flex-col">
            <h3 className="text-base font-semibold mb-3">Preview</h3>
            <div className="flex-1 overflow-auto rounded-lg border">
              <img
                src={selected.url}
                alt=""
                className="w-full h-full object-contain"
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <button
                className="py-2 bg-blue-600 rounded text-white font-medium hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                className="py-2 bg-red-600 rounded text-white font-medium hover:bg-red-700"
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
    </div>
  );
};

export default BluePrintDetection;
