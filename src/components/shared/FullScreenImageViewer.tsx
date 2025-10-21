"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Share2,
  DownloadCloud,
} from "lucide-react";
import RightToolbar from "./RightToolbar";
import CompanyLogo from "./companyLogo/CompanyLogo";

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
  console.log("=========>detectionResults", detectionResults);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [displayDimensions, setDisplayDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [showDetections, setShowDetections] = useState(true);
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(
    new Set()
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leftToolbarOpen, setLeftToolbarOpen] = useState(true);
  const [activeTool, setActiveTool] = useState("select");
  const [showGrid, setShowGrid] = useState(false);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);

  const currentImage = images[currentIndex];

  // Reset zoom and position when image changes
  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setImagePosition({ x: 0, y: 0 });
    setSelectedClasses(new Set()); // Reset class filter on image change
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

    const allBoxes = detectionResults.predictions.map(
      (detection: any, index: number): Detection => {
        // Generate a color based on the detection class or index
        const colors = [
          "#ff5858ff",
          "#3ed1c8ff",
          "#45b7d1",
          "#59dc9fff",
          "#f9d869ff",
          "#d85fd8ff",
          "#66d8bbff",
          "#f6d450ff",
          "#a953ceff",
          "#5dafe6ff",
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

    // Filter by selected classes if any are selected
    if (selectedClasses.size === 0) {
      return allBoxes; // Show all if none selected
    }
    return allBoxes.filter((box: Detection) =>
      selectedClasses.has(box.class || "Unknown")
    );
  };

  const getClassCounts = (): { [key: string]: number } => {
    if (!detectionResults?.predictions) return {};

    const counts: { [key: string]: number } = {};
    detectionResults.predictions.forEach((detection: any) => {
      const className = detection.class || "Unknown";
      counts[className] = (counts[className] || 0) + 1;
    });

    return counts;
  };

  const getClassSummary = (): string => {
    const counts = getClassCounts();
    const summaryParts = Object.entries(counts).map(
      ([className, count]) => `${className} ${count}`
    );
    return summaryParts.join(", ");
  };

  const toggleClassSelection = (className: string) => {
    setSelectedClasses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(className)) {
        newSet.delete(className);
      } else {
        newSet.add(className);
      }
      return newSet;
    });
  };

  // Toolbar action handlers
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = currentImage.path;
    link.download = currentImage.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Blueprint: ${currentImage.name}`,
        url: currentImage.path,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(currentImage.path);
      // You could show a toast notification here
      alert("Blueprint link copied to clipboard!");
    }
  };

  const handleToggleGrid = () => {
    setShowGrid(!showGrid);
  };

  const handleAnnotate = () => {
    console.log("Starting annotation mode");
    // Implementation for annotation functionality
  };

  const handleMeasure = () => {
    console.log("Starting measurement mode");
    // Implementation for measurement functionality
  };

  const handleAddNote = () => {
    console.log("Adding note/pin");
    // Implementation for adding notes/pins
  };

  const handleCalculate = () => {
    console.log("Opening calculator");
    // Implementation for calculator functionality
  };

  if (!isOpen || !currentImage) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white bg-opacity-95 flex items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-[#1C2931] bg-opacity-50 px-4 py-2">
        <div className="flex justify-between items-center text-white">
          <div>
            <h3 className="text-lg font-medium truncate max-w-md">
              {/* <CompanyLogo width={150} /> */}
              {currentImage.name} Blue Print
            </h3>
            <p className="text-sm text-gray-900">
              {currentIndex + 1} of {images.length}
              {currentImage.pageNumber && ` • Page ${currentImage.pageNumber}`}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
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
              className="px-3 py-1 text-lg bg-green-500 hover:bg-green-700 hover:bg-opacity-20 mr-4 transition-colors"
              title="Reset View"
            >
              Reset
            </button>
            <button
              onClick={resetView}
              className="px-3 py-1 flex justify-center items-center gap-2 text-lg bg-[#009568] hover:bg-green-700 hover:bg-opacity-20  transition-colors"
              title="Reset View"
            >
              <DownloadCloud />
              Export PDF
            </button>
            {/* {detectionResults?.predictions && (
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
            )} */}
            {/* Toggle classes/sidebar button */}

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

      {/* Left Toolbar */}
      {leftToolbarOpen && (
        <div className="absolute left-3 top-24 bottom-0  z-20">
          <RightToolbar
            activeTool={activeTool}
            setTool={setActiveTool}
            onAnnotate={handleAnnotate}
            onMeasure={handleMeasure}
            onDownload={handleDownload}
            onShare={handleShare}
            onToggleGrid={handleToggleGrid}
            onAddNote={handleAddNote}
            onCalculate={handleCalculate}
            showGrid={showGrid}
            className=" shadow-xl border border-gray-200"
          />
        </div>
      )}

      {/* Image Container */}
      <div
        className={`flex-1 flex items-center justify-center cursor-move relative ${
          leftToolbarOpen ? "-pl-56 -ml-56 pr-16 mt-10" : "p-16"
        }`}
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
      <div className="absolute bottom-4 left-4 z-10 text-white text-sm bg-black bg-opacity-50 rounded-lg p-3 max-w-xs">
        <p className="text-xs text-gray-300 space-y-1">
          <span className="block">Use arrow keys or buttons to navigate</span>
          <span className="block">
            +/- to zoom • R to rotate • Esc to close
          </span>
          {zoom > 1 && <span className="block">Drag to pan when zoomed</span>}
        </p>
      </div>

      {/* Detection Results Panel (collapsible sidebar) */}
      {detectionResults && sidebarOpen && (
        <div className="absolute w-86 top-20 right-0 z-10 bg-gray-200 bg-opacity-75 text-black rounded-lg py-4 px-5 max-w-sm h-screen overflow-y-auto">
          <h4 className="text-lg font-medium mb-3 pt-10">Detection Results</h4>

          {/* Class Summary */}
          {/* {detectionResults.predictions &&
            detectionResults.predictions.length > 0 && (
              <div className="mb-4 p-3 bg-white border border-gray-300 bg-opacity-50 rounded-lg">
                <h5 className="text-sm font-medium mb-2">Summary:</h5>
                <p className="text-sm text-gray-900">{getClassSummary()}</p>
                <p className="text-xs text-gray-900 mt-1">
                  Total: {detectionResults.predictions.length} detection
                  {detectionResults.predictions.length !== 1 ? "s" : ""}
                </p>
              </div>
            )} */}

          {/* Class Breakdown */}
          {detectionResults.predictions &&
            detectionResults.predictions.length > 0 && (
              <div className="mb-4">
                <div className="space-y-1">
                  {Object.entries(getClassCounts()).map(
                    ([className, count]) => {
                      const isSelected = selectedClasses.has(className);
                      return (
                        <button
                          key={className}
                          onClick={() => toggleClassSelection(className)}
                          className={`w-full flex mt-2 justify-between text-lg rounded px-4 py-2 transition-colors
                             cursor-pointer hover:bg-opacity-30 ${
                               isSelected
                                 ? "bg-blue-500 text-white bg-opacity-40 border border-blue-400"
                                 : "bg-white bg-opacity-10 hover:bg-blue-200"
                             }`}
                        >
                          <span className="capitalize">{className}</span>
                          <span className="font-medium">{count}</span>
                        </button>
                      );
                    }
                  )}
                </div>
                {selectedClasses.size > 0 && (
                  <button
                    onClick={() => setSelectedClasses(new Set())}
                    className="mt-2 text-xs text-gray-800 hover:text-blue-800 underline"
                  >
                    Clear filter (show all)
                  </button>
                )}
              </div>
            )}
        </div>
      )}
    </div>
  );
}
