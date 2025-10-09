"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from "lucide-react";

interface Image {
  id: string;
  name: string;
  path: string;
  pageNumber?: number;
}

interface Detection {
  x: number;
  y: number;
  width: number;
  height: number;
  class?: string;
  confidence?: number;
  color: string;
  id: string;
}

interface FullScreenImageViewerProps {
  images: Image[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onImageChange?: (image: Image, index: number) => void;
  detectionResults?: any;
}

export default function FullScreenImageViewer({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  onImageChange,
  detectionResults,
}: FullScreenImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [displayDimensions, setDisplayDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [showDetections, setShowDetections] = useState(true);

  const currentImage = images[currentIndex];

  // Reset zoom and position when image changes
  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setImagePosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Update currentIndex when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Call API when current image changes or viewer opens
  useEffect(() => {
    if (isOpen && currentImage && onImageChange) {
      console.log(
        "=====> Calling API for image:",
        currentImage.name,
        "at index:",
        currentIndex
      );
      onImageChange(currentImage, currentIndex);
    }
  }, [currentIndex, isOpen]); // Removed currentImage and onImageChange from dependencies to avoid infinite loops

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case "+":
        case "=":
          zoomIn();
          break;
        case "-":
          zoomOut();
          break;
        case "r":
        case "R":
          rotate();
          break;
      }
    },
    [isOpen]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const zoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.5, 5));
  };

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.5, 0.1));
  };

  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const resetView = () => {
    setZoom(1);
    setRotation(0);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  };

  const getDetectionBoxes = (): Detection[] => {
    if (!detectionResults?.predictions || !showDetections) return [];

    return detectionResults.predictions.map(
      (detection: any, index: number): Detection => {
        // Generate a color based on the detection class or index
        const colors = [
          "#ff6b6b",
          "#4ecdc4",
          "#45b7d1",
          "#96ceb4",
          "#ffeaa7",
          "#dda0dd",
          "#98d8c8",
          "#f7dc6f",
          "#bb8fce",
          "#85c1e9",
        ];
        const color = colors[index % colors.length];

        return {
          x: detection.x || 0,
          y: detection.y || 0,
          width: detection.width || 0,
          height: detection.height || 0,
          class: detection.class,
          confidence: detection.confidence,
          color,
          id: `detection-${index}`,
        };
      }
    );
  };

  if (!isOpen || !currentImage) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-4">
        <div className="flex justify-between items-center text-white">
          <div>
            <h3 className="text-lg font-medium truncate max-w-md">
              {currentImage.name}
            </h3>
            <p className="text-sm text-gray-300">
              {currentIndex + 1} of {images.length}
              {currentImage.pageNumber && ` • Page ${currentImage.pageNumber}`}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={zoomOut}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-5 h-5" />
            </button>

            <span className="text-sm px-2">{Math.round(zoom * 100)}%</span>

            <button
              onClick={zoomIn}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-5 h-5" />
            </button>

            <button
              onClick={rotate}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="Rotate (R)"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            <button
              onClick={resetView}
              className="px-3 py-1 text-sm hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="Reset View"
            >
              Reset
            </button>

            {detectionResults?.predictions && (
              <button
                onClick={() => setShowDetections(!showDetections)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  showDetections
                    ? "bg-green-600 bg-opacity-80 text-white"
                    : "hover:bg-white hover:bg-opacity-20"
                }`}
                title="Toggle Detection Overlay"
              >
                {showDetections ? "Hide" : "Show"} Detections
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
            title="Previous Image (←)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
            title="Next Image (→)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Image Container */}
      <div
        className="flex-1 flex items-center justify-center p-16 cursor-move relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImage.path}
            alt={currentImage.name}
            className="max-w-full max-h-full object-contain transition-transform duration-200 select-none"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg) translate(${
                imagePosition.x / zoom
              }px, ${imagePosition.y / zoom}px)`,
              cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
            }}
            onLoad={handleImageLoad}
            onError={(e) => {
              e.currentTarget.src =
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==";
            }}
            draggable={false}
          />

          {/* Detection Overlay */}
          {detectionResults?.predictions &&
            showDetections &&
            imageDimensions.width > 0 && (
              <svg
                className="absolute inset-0 pointer-events-none"
                style={{
                  width: "100%",
                  height: "100%",
                  transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                }}
                viewBox={`0 0 ${imageDimensions.width} ${imageDimensions.height}`}
                preserveAspectRatio="xMidYMid meet"
              >
                {getDetectionBoxes().map((detection) => {
                  // proportional x-axis shift based on width
                  const shiftRatio =
                    Math.log2(detection.width * 20000000000000000000000000000) /
                    200; // non-linear smooth scaling
                  const xShift = detection.width * shiftRatio;
                  const yShift = detection.height * shiftRatio;

                  return (
                    <g key={detection.id}>
                      {/* Bounding box rectangle */}
                      <rect
                        x={detection.x - xShift}
                        y={detection.y - yShift}
                        width={detection.width}
                        height={detection.height}
                        fill="none"
                        stroke={detection.color}
                        strokeWidth="3"
                        strokeOpacity="0.8"
                      />
                      <rect
                        x={detection.x - xShift}
                        y={detection.y - yShift}
                        width={detection.width}
                        height={detection.height}
                        fill={detection.color}
                        fillOpacity="0.1"
                      />
                      {/* Label background */}
                      <rect
                        x={detection.x - xShift * 0.2}
                        y={detection.y + yShift - 12}
                        width={Math.max(
                          (detection.class?.length || 7) * 8 + 20,
                          60
                        )}
                        height="25"
                        fill={detection.color}
                        fillOpacity="0.9"
                      />

                      {/* Label text */}
                      <text
                        x={detection.x - xShift * 0.2}
                        y={detection.y + yShift + 5}
                        fill="white"
                        fontSize="14"
                        fontWeight="bold"
                        fontFamily="Arial, sans-serif"
                      >
                        {detection.class || "Unknown"}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
        </div>
      </div>

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex space-x-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-white"
                    : "bg-white bg-opacity-50 hover:bg-opacity-75"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 z-10 text-white text-sm bg-black bg-opacity-50 rounded-lg p-3 max-w-xs">
        <p className="text-xs text-gray-300 space-y-1">
          <span className="block">Use arrow keys or buttons to navigate</span>
          <span className="block">
            +/- to zoom • R to rotate • Esc to close
          </span>
          {zoom > 1 && <span className="block">Drag to pan when zoomed</span>}
        </p>
      </div>

      {/* Detection Results Panel */}
      {detectionResults && (
        <div className="absolute top-20 right-4 z-10 bg-black bg-opacity-75 text-white rounded-lg p-4 max-w-sm max-h-96 overflow-y-auto">
          <h4 className="text-lg font-medium mb-3">Detection Results</h4>
          <div className="space-y-2 text-sm">
            {detectionResults.detections &&
            detectionResults.detections.length > 0 ? (
              detectionResults.detections.map(
                (detection: any, index: number) => (
                  <div
                    key={index}
                    className="bg-white bg-opacity-10 rounded p-2"
                  >
                    <p>
                      <strong>Class:</strong> {detection.class || "Unknown"}
                    </p>
                    <p>
                      <strong>Confidence:</strong>{" "}
                      {(detection.confidence * 100).toFixed(1)}%
                    </p>
                    {detection.bbox && (
                      <p>
                        <strong>Position:</strong> x:{detection.bbox[0]}, y:
                        {detection.bbox[1]}
                      </p>
                    )}
                  </div>
                )
              )
            ) : (
              <p className="text-gray-300">No detections found</p>
            )}
          </div>
          <div className="mt-3 pt-2 border-t border-gray-600 text-xs text-gray-300">
            <p>
              <strong>Processing Time:</strong>{" "}
              {detectionResults.processing_time || "N/A"}
            </p>
            <p>
              <strong>Model:</strong> {detectionResults.model || "N/A"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
