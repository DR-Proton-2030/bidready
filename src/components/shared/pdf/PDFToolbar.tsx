"use client";
import React from "react";
import {
  MousePointer,
  Pen,
  Highlighter,
  Eraser,
  Type,
  Square,
  Circle,
  ArrowRight,
  Minus,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Trash2,
  Download,
  Undo,
  Redo,
  Save,
} from "lucide-react";
import { AnnotationTool } from "@/@types/pdf/pdfAnnotation.interface";

interface PDFToolbarProps {
  selectedTool: AnnotationTool;
  onToolSelect: (tool: AnnotationTool) => void;
  toolColor: string;
  onColorChange: (color: string) => void;
  toolWidth: number;
  onWidthChange: (width: number) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onRotatePage: () => void;
  onDeletePage: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClearPage: () => void;
  onExport: () => void;
  canUndo: boolean;
  canRedo: boolean;
  showExportButton?: boolean;
  exportButtonText?: string;
}

const PDFToolbar: React.FC<PDFToolbarProps> = ({
  selectedTool,
  onToolSelect,
  toolColor,
  onColorChange,
  toolWidth,
  onWidthChange,
  fontSize,
  onFontSizeChange,
  currentPage,
  totalPages,
  onPageChange,
  zoom,
  onZoomChange,
  onRotatePage,
  onDeletePage,
  onUndo,
  onRedo,
  onClearPage,
  onExport,
  canUndo,
  canRedo,
  showExportButton = true,
  exportButtonText = "Export",
}) => {
  const tools: Array<{ tool: AnnotationTool; icon: React.ReactNode; label: string }> = [
    { tool: "select", icon: <MousePointer size={20} />, label: "Select" },
    { tool: "pen", icon: <Pen size={20} />, label: "Pen" },
    { tool: "highlighter", icon: <Highlighter size={20} />, label: "Highlighter" },
    { tool: "eraser", icon: <Eraser size={20} />, label: "Eraser" },
    { tool: "text", icon: <Type size={20} />, label: "Text" },
    { tool: "rectangle", icon: <Square size={20} />, label: "Rectangle" },
    { tool: "circle", icon: <Circle size={20} />, label: "Circle" },
    { tool: "arrow", icon: <ArrowRight size={20} />, label: "Arrow" },
    { tool: "line", icon: <Minus size={20} />, label: "Line" },
  ];

  const colors = [
    "#000000", // Black
    "#FF0000", // Red
    "#00FF00", // Green
    "#0000FF", // Blue
    "#FFFF00", // Yellow
    "#FF00FF", // Magenta
    "#00FFFF", // Cyan
    "#FFA500", // Orange
    "#800080", // Purple
    "#FFFFFF", // White
  ];

  return (
    <div className="bg-white border-b border-gray-300 shadow-sm">
      {/* Main Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 gap-4">
        {/* Drawing Tools */}
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-gray-700 mr-2">Tools:</span>
          {tools.map(({ tool, icon, label }) => (
            <button
              key={tool}
              onClick={() => onToolSelect(tool)}
              className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                selectedTool === tool
                  ? "bg-blue-100 text-blue-600 border border-blue-300"
                  : "text-gray-600"
              }`}
              title={label}
            >
              {icon}
            </button>
          ))}
        </div>

        {/* History Controls */}
        <div className="flex items-center gap-1 border-l border-gray-300 pl-4">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo size={20} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo size={20} />
          </button>
        </div>

        {/* Page Navigation */}
        <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Previous Page"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium whitespace-nowrap">
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Next Page"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
          <button
            onClick={() => onZoomChange(zoom - 0.25)}
            disabled={zoom <= 0.5}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
          <span className="text-sm font-medium min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(zoom + 0.25)}
            disabled={zoom >= 3}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
        </div>

        {/* Page Actions */}
        <div className="flex items-center gap-1 border-l border-gray-300 pl-4">
          <button
            onClick={onRotatePage}
            className="p-2 rounded hover:bg-gray-100"
            title="Rotate Page"
          >
            <RotateCw size={20} />
          </button>
          <button
            onClick={onDeletePage}
            disabled={totalPages <= 1}
            className="p-2 rounded hover:bg-gray-100 text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Delete Page"
          >
            <Trash2 size={20} />
          </button>
          <button
            onClick={onClearPage}
            className="p-2 rounded hover:bg-gray-100 text-orange-600"
            title="Clear Page Annotations"
          >
            <Eraser size={20} />
          </button>
        </div>

        {/* Export */}
        {showExportButton && (
          <div className="flex items-center border-l border-gray-300 pl-4">
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              title="Export PDF"
            >
              <Download size={20} />
              <span className="text-sm font-medium">{exportButtonText}</span>
            </button>
          </div>
        )}
      </div>

      {/* Secondary Toolbar - Tool Settings */}
      <div className="flex items-center gap-6 px-4 py-2 bg-gray-50 border-t border-gray-200">
        {/* Color Picker */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Color:</span>
          <div className="flex gap-1">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className={`w-8 h-8 rounded border-2 transition-all ${
                  toolColor === color
                    ? "border-blue-500 scale-110"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            <input
              type="color"
              value={toolColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
              title="Custom Color"
            />
          </div>
        </div>

        {/* Width/Size Controls */}
        {(selectedTool === "pen" ||
          selectedTool === "highlighter" ||
          selectedTool === "eraser" ||
          selectedTool === "line" ||
          selectedTool === "arrow" ||
          selectedTool === "rectangle" ||
          selectedTool === "circle") && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Width:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={toolWidth}
              onChange={(e) => onWidthChange(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-sm text-gray-600 min-w-[30px]">{toolWidth}px</span>
          </div>
        )}

        {/* Font Size Control */}
        {selectedTool === "text" && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Font Size:</span>
            <input
              type="range"
              min="8"
              max="72"
              value={fontSize}
              onChange={(e) => onFontSizeChange(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-sm text-gray-600 min-w-[30px]">{fontSize}px</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFToolbar;
