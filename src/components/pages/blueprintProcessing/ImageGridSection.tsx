"use client";
import React from "react";
import { FileImage, Eye, Trash2, Grid, Maximize } from "lucide-react";

interface ProcessedImage {
  id: string;
  name: string;
  path: string;
  pageNumber?: number;
  svgOverlay?: string | null;
}

interface ImageGridSectionProps {
  images: ProcessedImage[];
  selectedIndex: number;
  viewMode: "fullscreen" | "grid";
  isDetecting: boolean;
  imageDetectionResults: Map<string, any>;
  onImageSelect: (index: number) => void;
  onViewModeChange: (mode: "fullscreen" | "grid") => void;
  onDetectImage: (image: ProcessedImage) => void;
  onDetectAll: () => void;
  onRemoveImage: (imageId: string, event?: React.MouseEvent) => void;
  onOpenViewer: () => void;
}

const ImageGridSection: React.FC<ImageGridSectionProps> = ({
  images,
  selectedIndex,
  viewMode,
  isDetecting,
  imageDetectionResults,
  onImageSelect,
  onViewModeChange,
  onDetectImage,
  onDetectAll,
  onRemoveImage,
  onOpenViewer,
}) => {
  if (images.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <FileImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">No images available</p>
        <p className="text-sm text-gray-500 mt-2">
          Upload blueprint files to get started
        </p>
      </div>
    );
  }

  const selectedImage = images[selectedIndex];
  const hasDetection = selectedImage && imageDetectionResults.has(selectedImage.id);

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Unprocessed Images
          </h3>
          <p className="text-sm text-gray-500">
            {images.length} image{images.length !== 1 ? "s" : ""} ready for detection
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <button
            onClick={() => onViewModeChange(viewMode === "fullscreen" ? "grid" : "fullscreen")}
            className="inline-flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {viewMode === "fullscreen" ? (
              <>
                <Grid className="w-4 h-4 mr-2" />
                Grid View
              </>
            ) : (
              <>
                <Maximize className="w-4 h-4 mr-2" />
                Fullscreen
              </>
            )}
          </button>

          {/* Detection Buttons */}
          {viewMode === "fullscreen" && selectedImage && !hasDetection && (
            <button
              onClick={() => onDetectImage(selectedImage)}
              disabled={isDetecting}
              className={`inline-flex items-center px-4 py-2 rounded-md ${
                isDetecting
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isDetecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Detecting...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Detect Current
                </>
              )}
            </button>
          )}

          {images.length > 1 && (
            <button
              onClick={onDetectAll}
              disabled={isDetecting}
              className={`inline-flex items-center px-4 py-2 rounded-md ${
                isDetecting
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {isDetecting ? "Processing..." : "Detect All"}
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      {viewMode === "fullscreen" ? (
        <FullscreenView
          image={selectedImage}
          images={images}
          selectedIndex={selectedIndex}
          imageDetectionResults={imageDetectionResults}
          onImageSelect={onImageSelect}
          onRemoveImage={onRemoveImage}
          onOpenViewer={onOpenViewer}
        />
      ) : (
        <GridView
          images={images}
          imageDetectionResults={imageDetectionResults}
          onImageSelect={(index) => {
            onImageSelect(index);
            onViewModeChange("fullscreen");
          }}
          onRemoveImage={onRemoveImage}
          onDetectImage={onDetectImage}
          isDetecting={isDetecting}
        />
      )}
    </div>
  );
};

// Fullscreen View Sub-component
const FullscreenView: React.FC<{
  image: ProcessedImage;
  images: ProcessedImage[];
  selectedIndex: number;
  imageDetectionResults: Map<string, any>;
  onImageSelect: (index: number) => void;
  onRemoveImage: (imageId: string, event?: React.MouseEvent) => void;
  onOpenViewer: () => void;
}> = ({ image, images, selectedIndex, imageDetectionResults, onImageSelect, onRemoveImage, onOpenViewer }) => {
  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden">
        <img
          src={image.path}
          alt={image.name}
          className="max-w-full max-h-full object-contain cursor-pointer"
          onClick={onOpenViewer}
        />
        
        {/* Detection Badge */}
        {imageDetectionResults.has(image.id) && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
            ✓ Detected
          </div>
        )}
      </div>

      {/* Image Info */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200">
        <div>
          <h3 className="font-medium text-gray-900">{image.name}</h3>
          {image.pageNumber && (
            <p className="text-sm text-gray-500">Page {image.pageNumber}</p>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {selectedIndex + 1} of {images.length}
          </div>
          <button
            onClick={(e) => onRemoveImage(image.id, e)}
            className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove
          </button>
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((img, index) => (
            <div key={img.id} className="relative flex-shrink-0">
              <button
                onClick={() => onImageSelect(index)}
                className={`w-32 h-32 rounded border-2 overflow-hidden ${
                  index === selectedIndex
                    ? "border-blue-500"
                    : imageDetectionResults.has(img.id)
                    ? "border-green-300"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <img
                  src={img.path}
                  alt={img.name}
                  className="w-full h-full object-cover"
                />
              </button>
              {imageDetectionResults.has(img.id) && (
                <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Grid View Sub-component
const GridView: React.FC<{
  images: ProcessedImage[];
  imageDetectionResults: Map<string, any>;
  onImageSelect: (index: number) => void;
  onRemoveImage: (imageId: string, event?: React.MouseEvent) => void;
  onDetectImage: (image: ProcessedImage) => void;
  isDetecting: boolean;
}> = ({ images, imageDetectionResults, onImageSelect, onRemoveImage, onDetectImage, isDetecting }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image, index) => {
        const hasDetection = imageDetectionResults.has(image.id);
        
        return (
          <div
            key={image.id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow relative group bg-white"
          >
            <div
              className="aspect-video bg-gray-100 flex items-center justify-center cursor-pointer relative"
              onClick={() => onImageSelect(index)}
            >
              <img
                src={image.path}
                alt={image.name}
                className="max-w-full max-h-full object-contain"
              />
              
              {hasDetection && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                  ✓ Detected
                </div>
              )}
            </div>

            {/* Remove Button */}
            <button
              onClick={(e) => onRemoveImage(image.id, e)}
              className="absolute top-2 left-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
              title="Remove this image"
            >
              <Trash2 className="w-3 h-3" />
            </button>

            <div className="p-3">
              <h4 className="font-medium text-gray-900 truncate text-sm">
                {image.name}
              </h4>
              {image.pageNumber && (
                <p className="text-xs text-gray-500">Page {image.pageNumber}</p>
              )}
              
              <div className="mt-2 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageSelect(index);
                  }}
                  className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  View
                </button>
                {!hasDetection && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDetectImage(image);
                    }}
                    disabled={isDetecting}
                    className={`flex-1 px-3 py-1.5 rounded text-sm ${
                      isDetecting
                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    Detect
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ImageGridSection;
