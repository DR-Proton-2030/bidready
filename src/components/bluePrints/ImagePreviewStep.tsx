"use client";
import React from "react";
import { X, FileImage } from "lucide-react";
import { ProcessedImage } from "@/utils/fileProcessing";

interface Props {
  processedImages: ProcessedImage[];
  onRemoveImage?: (imageId: string) => void;
  onClearAll?: () => void;
  fileType: "image" | "pdf" | null;
  totalPages?: number;
}

const ImagePreviewStep: React.FC<Props> = ({
  processedImages,
  onRemoveImage,
  onClearAll,
  fileType,
  totalPages,
}) => {
  if (processedImages.length === 0) {
    return (
      <div className="text-center py-12">
        <FileImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Images to Preview
        </h3>
        <p className="text-gray-500">
          Go back to step 1 to upload files first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Preview Uploaded Images
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Review the {processedImages.length} processed image
            {processedImages.length !== 1 ? "s" : ""} before creating your
            blueprint.
            {fileType === "pdf" &&
              ` Converted from PDF with ${totalPages} pages.`}
          </p>
        </div>
        {onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* File Info */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <FileImage className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-700">
            {fileType === "pdf"
              ? `PDF processed: ${processedImages.length} pages converted to images`
              : `${processedImages.length} image${
                  processedImages.length !== 1 ? "s" : ""
                } uploaded`}
          </span>
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {processedImages.map((image) => (
          <div
            key={image.id}
            className="relative group border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.dataUrl}
              alt={image.name}
              className="w-full h-40 object-cover"
            />

            {/* Image Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <p className="text-white text-xs font-medium truncate">
                {image.pageNumber ? `Page ${image.pageNumber}` : image.name}
              </p>
              <p className="text-white/80 text-xs">
                Image {processedImages.indexOf(image) + 1}
              </p>
            </div>

            {/* Remove Button */}
            {onRemoveImage && (
              <button
                type="button"
                onClick={() => onRemoveImage(image.id)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                title="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            )}

            {/* Selection indicator (if needed in future) */}
            <div className="absolute top-2 left-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
              {image.pageNumber || processedImages.indexOf(image) + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="text-center text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
        <p>
          Ready to create blueprint with {processedImages.length} image
          {processedImages.length !== 1 ? "s" : ""}. Click &quot;Create
          Blueprint&quot; to proceed.
        </p>
      </div>
    </div>
  );
};

export default ImagePreviewStep;
