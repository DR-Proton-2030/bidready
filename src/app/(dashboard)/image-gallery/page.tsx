"use client";
import React, { useState } from "react";
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
} from "lucide-react";
import { ProcessedImage } from "@/utils/fileProcessing";

// Mock data for demo - in real app, this would come from props/context/URL params
const mockImages: ProcessedImage[] = [
  {
    id: "1",
    name: "blueprint-page-1.jpg",
    dataUrl: "/api/placeholder/800/600",
    pageNumber: 1,
    originalFile: new File([], "blueprint.pdf"),
  },
  {
    id: "2",
    name: "blueprint-page-2.jpg",
    dataUrl: "/api/placeholder/800/600",
    pageNumber: 2,
    originalFile: new File([], "blueprint.pdf"),
  },
];

const ImageGalleryPage: React.FC = () => {
  const [images] = useState<ProcessedImage[]>(mockImages);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const selectedImage =
    selectedImageIndex !== null ? images[selectedImageIndex] : null;

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
    setZoom(100);
    setRotation(0);
  };

  const handleCloseModal = () => {
    setSelectedImageIndex(null);
    setZoom(100);
    setRotation(0);
  };

  const handlePrevious = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
      setZoom(100);
      setRotation(0);
    }
  };

  const handleNext = () => {
    if (selectedImageIndex !== null && selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
      setZoom(100);
      setRotation(0);
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDownload = (image: ProcessedImage) => {
    const link = document.createElement("a");
    link.href = image.dataUrl;
    link.download = image.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Image Gallery</h1>
            <p className="text-gray-600 mt-1">
              View and manage your processed blueprint images ({images.length}{" "}
              images)
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg ${
                viewMode === "grid"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg ${
                viewMode === "list"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Image Grid/List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {images.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Grid3X3 className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No images available
            </h3>
            <p className="text-gray-600">Upload some files to see them here.</p>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="group relative border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleImageSelect(index)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.dataUrl}
                      alt={image.name}
                      className="w-full h-40 object-cover"
                    />

                    {/* Overlay with info */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Maximize2 className="h-8 w-8 text-white" />
                      </div>
                    </div>

                    {/* Image Info */}
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {image.pageNumber
                          ? `Page ${image.pageNumber}`
                          : image.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {image.name}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(image);
                        }}
                        className="bg-white text-gray-600 hover:text-blue-600 rounded-full p-1.5 shadow-sm hover:shadow-md transition-all"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleImageSelect(index)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.dataUrl}
                      alt={image.name}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {image.pageNumber
                          ? `Page ${image.pageNumber}`
                          : image.name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {image.name}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(image);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <Maximize2 className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal for detailed view */}
      {selectedImage && (
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
                  {selectedImageIndex! + 1} of {images.length}
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                  className="p-2 text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ZoomOut className="h-5 w-5" />
                </button>

                <span className="text-sm text-gray-600 min-w-[4rem] text-center">
                  {zoom}%
                </span>

                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 300}
                  className="p-2 text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>

                <div className="w-px h-6 bg-gray-300 mx-2" />

                <button
                  onClick={handleRotate}
                  className="p-2 text-gray-600 hover:text-blue-600"
                >
                  <RotateCw className="h-5 w-5" />
                </button>

                <button
                  onClick={() => handleDownload(selectedImage)}
                  className="p-2 text-gray-600 hover:text-blue-600"
                >
                  <Download className="h-5 w-5" />
                </button>

                <button
                  onClick={handleCloseModal}
                  className="p-2 text-gray-600 hover:text-red-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-hidden bg-gray-100 relative">
              {/* Navigation Buttons */}
              {selectedImageIndex! > 0 && (
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 rounded-full p-2 shadow-lg transition-all"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}

              {selectedImageIndex! < images.length - 1 && (
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 rounded-full p-2 shadow-lg transition-all"
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
                  className="max-w-none transition-transform duration-200"
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    maxHeight: zoom <= 100 ? "100%" : "none",
                    maxWidth: zoom <= 100 ? "100%" : "none",
                  }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">File:</span>{" "}
                  {selectedImage.name}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Use mouse wheel to zoom, arrow keys to navigate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGalleryPage;
