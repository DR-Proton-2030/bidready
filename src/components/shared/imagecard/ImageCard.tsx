"use client";
import React from "react";
import { BlueprintImage } from "../../../hooks/useBlueprintImages";
import { Trash2 } from "lucide-react";

interface ImageCardProps {
  image: BlueprintImage;
  selected?: boolean;
  deleting?: boolean;
  className?: string;
  draggable?: boolean;
  onClick?: (img: BlueprintImage) => void;
  onToggleSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  hasDetection?: boolean;
  selectable?: boolean;
}

export default function ImageCard({
  image,
  selected = false,
  deleting = false,
  className = "",
  draggable = false,
  onClick,
  onToggleSelect,
  onDelete,
  onDragStart,
  hasDetection = false,
  selectable = true,
}: ImageCardProps) {
  return (
    <div
      key={image.id}
      draggable={draggable}
      onDragStart={onDragStart}
      className={`relative rounded-lg overflow-hidden bg-white  cursor-pointer border-2 border-gray-200
                    transition transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      selected ? "ring-2 ring-blue-500" : ""
                    } ${className}`}
      onClick={() => onClick?.(image)}
      tabIndex={0}
      role="button"
      aria-pressed={selected}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick?.(image);
        else if (e.key === " ") {
          e.preventDefault();
          if (selectable) onToggleSelect?.(image.id);
        }
      }}
    >
      <label className="absolute top-2 left-2 z-10 bg-white/90 rounded-full p-0.5" aria-hidden>
        <input
          type="checkbox"
          checked={selected}
          disabled={!selectable}
          onChange={(e) => {
            e.stopPropagation();
            if (!selectable) return;
            onToggleSelect?.(image.id);
          }}
          aria-label={`Select image ${image.id}`}
          className="w-4 h-4"
        />
      </label>

      <img src={image.url ?? ""} alt="" className="w-full h-40 object-cover" />

      {/* detection indicator */}
      {hasDetection && (
        <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-md shadow">
          Detected
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.(image.id);
        }}
        disabled={deleting}
        aria-disabled={deleting}
        className={`absolute top-2 right-2 text-white text-xs px-1 py-1 rounded-md ${
          deleting ? "bg-gray-300" : "bg-red-600/70 hover:bg-red-700"
        }`}
      >
        <Trash2 scale={16} />
      </button>
    </div>
  );
}
