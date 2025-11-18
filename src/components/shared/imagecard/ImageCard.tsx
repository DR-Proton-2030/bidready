"use client";
import React from "react";
import { BlueprintImage } from "../../../hooks/useBlueprintImages";
import { Trash2, CheckCircle2, Image as ImageIcon } from "lucide-react";

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
      className={`group relative rounded-xl overflow-hidden border-2 border-white/80 bg-white/50 backdrop-blur-xl shadow-sm border border-gray-200 
        transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer ${selected ? "ring-2 ring-orange-500" : ""} ${className}`}
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
      {/* gradient highlight */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-orange-200/20 to-[#4A5565]/20 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none" /> */}

      {/* checkbox */}
      <div className="absolute top-3 left-3 z-20 flex items-center justify-center bg-white/90 backdrop-blur-md ">
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
          className="w-6 h-6 accent-orange-500 cursor-pointer rounded-full outline-none border-none"
        />
      </div>

      {/* image */}
      <div className="relative w-full h-44 bg-gray-100 flex items-center justify-center overflow-hidden">
        {image.url ? (
          <img
            src={image.url}
            alt="Blueprint preview"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <ImageIcon className="text-gray-400 w-12 h-12" />
        )}

        {/* subtle dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent pointer-events-none" />
      </div>

      {/* detection */}
      {hasDetection && (
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 bg-green-600/90 text-white text-xs px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm">
          <CheckCircle2 className="w-4 h-4" />
          Detected
        </div>
      )}

      {/* delete */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.(image.id);
        }}
        disabled={deleting}
        aria-disabled={deleting}
        className={`absolute top-3 right-3 z-20 p-2 rounded-full shadow-md text-white transition backdrop-blur-sm ${deleting ? "bg-gray-300 cursor-not-allowed" : "bg-red-500/80 hover:bg-red-600"}`}
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* footer */}
      <div className="relative z-10 p-3  border-t border-gray-200 text-sm font-medium text-[#4A5565] flex items-center justify-between">
        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">ID: {image.id.slice(0, 6)}</span>
      </div>
    </div>
  );
}