"use client";

import React from "react";

interface ProcessedImage {
  id: string;
  name: string;
  path: string;
  pageNumber?: number;
  svgOverlay?: string | null;
}

interface ProcessedImagesSectionProps {
  images: ProcessedImage[];
  onImageClick: (index: number) => void;
  onClearImages: () => void;
}

export default function ProcessedImagesSection({
  images,
  onImageClick,
  onClearImages,
}: ProcessedImagesSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Processed Images ({images.length})
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onImageClick(index)}
          >
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.path}
                alt={image.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="p-3">
              <h3 className="font-medium text-gray-900 text-sm truncate">
                {image.name}
              </h3>
              {image.pageNumber && (
                <p className="text-xs text-gray-500 mt-1">
                  Page {image.pageNumber}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <button
          type="button"
          onClick={onClearImages}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Clear and Upload New Files
        </button>
      </div>
    </div>
  );
}
