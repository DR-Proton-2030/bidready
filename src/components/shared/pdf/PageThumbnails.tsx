"use client";
import React, { useState } from "react";
import { PDFPageData } from "@/@types/pdf/pdfAnnotation.interface";
import { Copy, Trash2, GripVertical } from "lucide-react";

interface PageThumbnailsProps {
  pages: PDFPageData[];
  currentPage: number;
  onPageSelect: (pageNumber: number) => void;
  onReorderPages: (fromIndex: number, toIndex: number) => void;
  onDuplicatePage: (pageNumber: number) => void;
  onDeletePage: (pageNumber: number) => void;
}

const PageThumbnails: React.FC<PageThumbnailsProps> = ({
  pages,
  currentPage,
  onPageSelect,
  onReorderPages,
  onDuplicatePage,
  onDeletePage,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // Get total pages from the last page number if pages exist
  const totalPages = pages.length > 0 ? Math.max(...pages.map(p => p.pageNumber)) : 0;
  
  // Create array of all page numbers to show placeholders
  const allPageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  // Create a map for quick lookup of loaded pages
  const pageMap = new Map(pages.map(p => [p.pageNumber, p]));

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      onReorderPages(draggedIndex, dragOverIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleDragEnd();
  };

  return (
    <div className="w-48 max-h-[70vh] bg-gray-50 border-r border-gray-300 overflow-y-scroll flex flex-col h-full">
      <div className="p-3 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Pages ({pages.length}/{totalPages})
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="space-y-2">
          {allPageNumbers.map((pageNumber, index) => {
            const page = pageMap.get(pageNumber);
            const isLoaded = !!page;
            
            return (
              <div
                key={pageNumber}
                draggable={isLoaded}
                onDragStart={(e) => isLoaded && handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
                className={`
                  group relative bg-white rounded-lg border-2 transition-all cursor-pointer
                  ${
                    currentPage === pageNumber
                      ? "border-blue-500 shadow-md"
                      : "border-gray-200 hover:border-gray-400"
                  }
                  ${draggedIndex === index ? "opacity-50" : ""}
                  ${dragOverIndex === index ? "border-dashed border-blue-400" : ""}
                `}
                onClick={() => onPageSelect(pageNumber)}
              >
                {/* Drag Handle */}
                {isLoaded && (
                  <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical size={16} className="text-gray-400" />
                  </div>
                )}

                {/* Thumbnail Image */}
                <div className="p-2">
                  {isLoaded && page.thumbnailUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={page.thumbnailUrl}
                      alt={`Page ${pageNumber}`}
                      className="w-full h-auto rounded"
                      style={{
                        transform: `rotate(${page.rotation}deg)`,
                      }}
                    />
                  ) : (
                    <div className="w-full aspect-[8.5/11] bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-400 text-xs">Loading...</span>
                    </div>
                  )}
                </div>

                {/* Page Number */}
                <div className="px-2 pb-2">
                  <div className="text-xs font-medium text-center text-gray-600">
                    Page {pageNumber}
                  </div>
                </div>

                {/* Action Buttons */}
                {isLoaded && (
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicatePage(pageNumber);
                      }}
                      className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      title="Duplicate Page"
                    >
                      <Copy size={12} />
                    </button>
                    {totalPages > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete page ${pageNumber}?`)) {
                            onDeletePage(pageNumber);
                          }
                        }}
                        className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        title="Delete Page"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                )}

                {/* Annotation Count Badge */}
                {isLoaded && page && (page.annotations.drawings.length > 0 ||
                  page.annotations.texts.length > 0 ||
                  page.annotations.shapes.length > 0) && (
                  <div className="absolute bottom-8 right-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                    {page.annotations.drawings.length +
                      page.annotations.texts.length +
                      page.annotations.shapes.length}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PageThumbnails;
