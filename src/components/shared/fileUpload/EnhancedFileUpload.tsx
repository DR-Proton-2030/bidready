"use client";
import React, { useState } from "react";
import { X, FileImage, File, Loader2, Eye } from "lucide-react";
import { ProcessedImage } from "@/utils/fileProcessing";
import ImageDetailModal from "./ImageDetailModal";

interface Props {
  onChange: (file: File | null) => void;
  processedImages: ProcessedImage[];
  isProcessing: boolean;
  error: string | null;
  fileType: "image" | "pdf" | null;
  totalPages?: number;
  onRemoveImage?: (imageId: string) => void;
  onClearAll?: () => void;
}

const EnhancedFileUpload: React.FC<Props> = ({
  onChange,
  processedImages,
  isProcessing,
  error,
  fileType,
  totalPages,
  onRemoveImage,
  onClearAll,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    console.log("File selected:", file?.name, file?.type, file?.size);
    onChange(file);
  };

  const handleViewDetails = (imageIndex: number) => {
    setSelectedImageIndex(imageIndex);
    setIsModalOpen(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] || null;
    console.log("File dropped:", file?.name, file?.type, file?.size);
    onChange(file);
  };

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200 hover:border-blue-500 hover:bg-blue-50
          ${error ? "border-red-300 bg-red-50" : "border-gray-300"}
          ${isProcessing ? "pointer-events-none opacity-50" : ""}
        `}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="space-y-2">
            <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-600">Processing file...</p>
            {fileType === "pdf" && (
              <p className="text-xs text-gray-500">
                Converting PDF pages to images
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <FileImage className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">
                Drop your blueprint file here or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports images (PNG, JPG, GIF, WebP, SVG) and PDF files up to
                10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* File Info */}
      {fileType && processedImages.length > 0 && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <File className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                {fileType === "pdf"
                  ? `PDF processed: ${processedImages.length} pages`
                  : "Image uploaded"}
                {totalPages && ` (${totalPages} total pages)`}
              </span>
            </div>
            {onClearAll && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      )}

      {/* Image Previews */}
      {processedImages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              Processed Images ({processedImages.length})
            </h4>
            {processedImages.length > 1 && (
              <button
                type="button"
                onClick={() => handleViewDetails(0)}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <Eye className="h-4 w-4" />
                <span>View Details</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
            {processedImages.map((image, index) => (
              <div
                key={image.id}
                className="relative group border border-gray-200 rounded-lg overflow-hidden bg-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.dataUrl}
                  alt={image.name}
                  className="w-full h-32 object-cover cursor-pointer"
                  onClick={() => handleViewDetails(index)}
                />

                {/* Image Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1">
                  <p className="text-xs truncate">
                    {image.pageNumber ? `Page ${image.pageNumber}` : image.name}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(index);
                    }}
                    className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 transition-colors"
                    title="View details"
                  >
                    <Eye className="h-3 w-3" />
                  </button>
                  {onRemoveImage && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveImage(image.id);
                      }}
                      className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Detail Modal */}
      <ImageDetailModal
        images={processedImages}
        initialIndex={selectedImageIndex}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRemoveImage={onRemoveImage}
      />
    </div>
  );
};

export default EnhancedFileUpload;
