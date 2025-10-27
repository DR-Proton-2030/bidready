"use client";

import React from "react";
import { Maximize2, Share2, Download, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCardProps {
  src?: string;
  alt?: string;
  onExpand?: () => void;
  onGroup?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

const RightPanelImageCard: React.FC<ImageCardProps> = ({
  src,
  alt = "preview",
  onExpand,
  onGroup,
  onDownload,
  onDelete,
  onPrev,
  onNext,
}) => {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-100 group">
      {/* Image */}
      {src ? (
        <div className="relative w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
          <img src={src} alt={alt} className="w-full h-40 object-cover block" />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:bg-black/30" />

          

          {/* Top Action Buttons */}
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onExpand}
              className="p-1.5 bg-white/80 hover:bg-white rounded-full shadow"
            >
              <Maximize2 className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={onDownload}
              className="p-1.5 bg-white/80 hover:bg-white rounded-full shadow"
            >
              <Download className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 bg-white/80 hover:bg-white rounded-full shadow"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full h-40 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
          <div className="w-28 h-28 rounded-lg bg-white/60" />
        </div>
      )}
    </div>
  );
};

export default RightPanelImageCard;
