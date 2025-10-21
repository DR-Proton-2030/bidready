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
  Search,
  Plus,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [customClasses, setCustomClasses] = useState<string[]>([]);

  const currentImage = images[currentIndex];

  // Predefined colors for consistent class mapping
  const classColors = [
    "#ff5858ff", // Red
    "#3ed1c8ff", // Teal
    "#45b7d1ff", // Blue
    "#59dc9fff", // Green
    "#f9d869ff", // Yellow
    "#d85fd8ff", // Magenta
    "#66d8bbff", // Light Teal
    "#f6d450ff", // Gold
    "#a953ceff", // Purple
    "#f342e7ff", // Sky Blue
    "#ff8a80ff", // Light Red
    "#80cbc4ff", // Mint
    "#81c784ff", // Light Green
    "#ffb74dff", // Orange
    "#ba68c8ff", // Light Purple
    "#4fc3f7ff", // Cyan
    "#aed581ff", // Lime
    "#ffcc80ff", // Peach
    "#f48fb1ff", // Pink
    "#90a4aeff", // Blue Grey
  ];

  // Function to get consistent color for a class
  const getColorForClass = (className: string): string => {
    if (!className) return classColors[0];

    // Create a simple hash from the class name for consistent color assignment
    let hash = 0;
    for (let i = 0; i < className.length; i++) {
      hash = className.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % classColors.length;
    return classColors[colorIndex];
  };

  // Reset zoom and position when image changes
  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setImagePosition({ x: 0, y: 0 });
    setSelectedClasses(new Set()); // Reset class filter on image change
    setSearchTerm(""); // Reset search term on image change
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
        const className = detection.class || "Unknown";
        const color = getColorForClass(className);

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

  // Filter classes based on search term
  const getFilteredClasses = () => {
    const allClassCounts = getClassCounts();
    const allClasses = Object.keys(allClassCounts);

    if (!searchTerm) return allClassCounts;

    const filteredCounts: { [key: string]: number } = {};
    allClasses
      .filter((className) =>
        className.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .forEach((className) => {
        filteredCounts[className] = allClassCounts[className];
      });

    return filteredCounts;
  };

  // Add new custom class
  const handleAddNewClass = () => {
    if (newClassName.trim() && !customClasses.includes(newClassName.trim())) {
      setCustomClasses((prev) => [...prev, newClassName.trim()]);
      setNewClassName("");
      setShowAddClassModal(false);
    }
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
        <div className="absolute w-96 top-0 right-0 z-10 bg-white bg-opacity-95 text-black rounded-lg py-4 px-5 max-w-sm h-screen overflow-y-auto shadow-2xl border border-gray-300">
          <div className="flex items-center justify-between mb-4 pt-6">
            <h4 className="text-xl font-bold text-gray-800">
              Detection Results
            </h4>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Add New Class Button */}
          <button
            onClick={() => setShowAddClassModal(true)}
            className="w-full flex items-center justify-center gap-2 mb-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add New Class
          </button>

          {/* Class Breakdown */}
          {detectionResults.predictions &&
            detectionResults.predictions.length > 0 && (
              <div className="mb-4">
                <div className="space-y-1">
                  {Object.entries(getFilteredClasses()).map(
                    ([className, count]) => {
                      const isSelected = selectedClasses.has(className);
                      const classColor = getColorForClass(className);

                      return (
                        <button
                          key={className}
                          onClick={() => toggleClassSelection(className)}
                          className={`w-full flex items-center gap-3 px-3 py-1 rounded transition-all duration-200 ${
                            isSelected
                              ? "bg-blue-50 border-blue-300 shadow-md"
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                          }`}
                        >
                          {/* Color Indicator */}
                          <div
                            className="w-4 h-4 rounded  border-white shadow-sm flex-shrink-0"
                            style={{ backgroundColor: classColor }}
                          ></div>

                          <div className="flex-1 flex justify-between items-center">
                            <span className="capitalize text-sm font-medium text-gray-700">
                              {className}
                            </span>
                            <span className="text-xs font-bold px-2 py-1 rounded text-black shadow-sm">
                              {count}
                            </span>
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>

                {/* Clear Filter Button */}
                {selectedClasses.size > 0 && (
                  <button
                    onClick={() => setSelectedClasses(new Set())}
                    className="mt-3 w-full text-sm text-gray-600 hover:text-blue-600 underline py-1"
                  >
                    Clear filter (show all{" "}
                    {Object.keys(getClassCounts()).length} classes)
                  </button>
                )}

                {/* Summary Stats */}
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">
                    Total Detections:
                  </p>
                  <p className="text-lg font-bold text-gray-800">
                    {detectionResults.predictions.length}
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    {Object.keys(getClassCounts()).length} different classes
                    detected
                  </p>
                </div>
              </div>
            )}

          {/* Custom Classes Section */}
          {customClasses.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h5 className="text-sm font-semibold text-gray-700 mb-2">
                Custom Classes
              </h5>
              <div className="space-y-1">
                {customClasses.map((className, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded text-sm"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getColorForClass(className) }}
                    ></div>
                    <span className="capitalize">{className}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add New Class Modal */}
      {showAddClassModal && (
        <div className="fixed inset-0 bg-black/50 bg-blur-sm bg-opacity-50 flex items-center justify-center 0 z-60">
          <div className="bg-white rounded-lg p-6 w-96 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Class</h3>
            <input
              type="text"
              placeholder="Enter class name..."
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              onKeyPress={(e) => e.key === "Enter" && handleAddNewClass()}
            />
            <div className="flex gap-3">
              <button
                onClick={handleAddNewClass}
                disabled={!newClassName.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Add Class
              </button>
              <button
                onClick={() => {
                  setShowAddClassModal(false);
                  setNewClassName("");
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Sidebar Button (when closed) */}
      {!sidebarOpen && detectionResults && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute top-24 right-4 z-10 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          title="Show Detection Panel"
        >
          <Search className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
