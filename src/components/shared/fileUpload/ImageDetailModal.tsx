"use client";
import React, { useState, useCallback } from "react";
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ProcessedImage } from "@/utils/fileProcessing";

interface ImageDetailModalProps {
  images: ProcessedImage[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onRemoveImage?: (imageId: string) => void;
}

const ImageDetailModal: React.FC<ImageDetailModalProps> = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  onRemoveImage,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const selectedImage = images[selectedImageIndex];

  const handlePrevious = useCallback(() => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
      setZoom(100);
      setRotation(0);
    }
  }, [selectedImageIndex]);

  const handleNext = useCallback(() => {
    if (selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
      setZoom(100);
      setRotation(0);
    }
  }, [selectedImageIndex, images.length]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDownload = () => {
    if (selectedImage) {
      const link = document.createElement("a");
      link.href = selectedImage.dataUrl;
      link.download = selectedImage.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleRemove = () => {
    if (selectedImage && onRemoveImage) {
      onRemoveImage(selectedImage.id);

      // Adjust selected index if needed
      if (selectedImageIndex >= images.length - 1) {
        setSelectedImageIndex(Math.max(0, images.length - 2));
      }

      // Close modal if no images left
      if (images.length <= 1) {
        onClose();
      }
    }
  };

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          handlePrevious();
          break;
        case "ArrowRight":
          event.preventDefault();
          handleNext();
          break;
        case "Escape":
          event.preventDefault();
          onClose();
          break;
        case "+":
        case "=":
          event.preventDefault();
          handleZoomIn();
          break;
        case "-":
          event.preventDefault();
          handleZoomOut();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleNext, handlePrevious, onClose]);

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedImageIndex(initialIndex);
      setZoom(100);
      setRotation(0);
    }
  }, [isOpen, initialIndex]);

  if (!isOpen || !selectedImage) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-6xl max-h-[90vh] w-full flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedImage.pageNumber
                ? `Page ${selectedImage.pageNumber}`
                : selectedImage.name}
            </h2>
            <span className="text-sm text-gray-500">
              {selectedImageIndex + 1} of {images.length}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="p-2 text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="h-5 w-5" />
            </button>

            <span className="text-sm text-gray-600 min-w-[4rem] text-center">
              {zoom}%
            </span>

            <button
              onClick={handleZoomIn}
              disabled={zoom >= 300}
              className="p-2 text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="h-5 w-5" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            <button
              onClick={handleRotate}
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
              title="Rotate"
            >
              <RotateCw className="h-5 w-5" />
            </button>

            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
              title="Download"
            >
              <Download className="h-5 w-5" />
            </button>

            {onRemoveImage && (
              <button
                onClick={handleRemove}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                title="Remove image"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            <div className="w-px h-6 bg-gray-300 mx-2" />

            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden bg-gray-100 relative">
          {/* Navigation Buttons */}
          {selectedImageIndex > 0 && (
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 rounded-full p-2 shadow-lg transition-all"
              title="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {selectedImageIndex < images.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 rounded-full p-2 shadow-lg transition-all"
              title="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Image Container */}
          <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage.dataUrl}
              alt={selectedImage.name}
              className="max-w-none transition-transform duration-200 select-none"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                maxHeight: zoom <= 100 ? "100%" : "none",
                maxWidth: zoom <= 100 ? "100%" : "none",
              }}
              draggable={false}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">File:</span> {selectedImage.name}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>
                Use arrow keys to navigate • +/- to zoom • ESC to close
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDetailModal;
