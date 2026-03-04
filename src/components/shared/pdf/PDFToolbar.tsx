"use client";
import React, { useState } from "react";
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
  ChevronDown,
} from "lucide-react";
import { HexColorPicker } from "react-colorful";
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
  const [showColorPicker, setShowColorPicker] = useState(false);

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

  const presetColors = [
    "#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00",
  ];

  return (
    <div className="bg-white border-b border-gray-200 shadow-md overflow-x-auto">
      {/* Main Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 gap-4">
        {/* Drawing Tools */}
        <div className="flex items-center gap-2 p-2 bg-black/80 rounded-2xl border border-gray-200 shadow-sm">
          {tools.map(({ tool, icon, label }) => (
            <button
              key={tool}
              onClick={() => onToolSelect(tool)}
              className={`p-2.5 rounded-lg transition-all duration-200 flex items-center justify-center font-medium text-sm ${
                selectedTool === tool
                  ? "bg-orange-600 text-white shadow-lg "
                  : "text-gray-300 hover:text-white hover:bg-white/10 border-2 border-transparent"
              }`}
              title={label}
            >
              {React.cloneElement(icon as React.ReactElement, { size: 18 } as any)}
            </button>
          ))}
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-3">
       

          {/* Zoom Controls */}
          <div className="flex items-center gap-2 p-2 bg-black/80 rounded-2xl border border-gray-200 shadow-sm">
            <button
              onClick={() => onZoomChange(zoom - 0.25)}
              disabled={zoom <= 0.5}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-2 border-transparent hover:border-gray-400"
              title="Zoom Out"
            >
              <ZoomOut size={18} />
            </button>
            <div className="px-3 text-xs font-bold text-white min-w-[50px] text-center">
              {Math.round(zoom * 100)}%
            </div>
            <button
              onClick={() => onZoomChange(zoom + 0.25)}
              disabled={zoom >= 3}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-2 border-transparent hover:border-gray-400"
              title="Zoom In"
            >
              <ZoomIn size={18} />
            </button>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center gap-2 p-2 bg-black/80 rounded-2xl border border-gray-200 shadow-sm">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-2 border-transparent hover:border-gray-400"
              title="Previous Page"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="px-2">
              <span className="text-xs font-bold text-white">{currentPage}</span>
              <span className="text-xs text-gray-400 mx-1">/</span>
              <span className="text-xs font-bold text-gray-400">{totalPages}</span>
            </div>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-2 border-transparent hover:border-gray-400"
              title="Next Page"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Page Actions */}
          <div className="flex items-center gap-2 p-2 bg-black/80 rounded-2xl border border-gray-200 shadow-sm">
            <button
              onClick={onRotatePage}
              className="p-2 rounded-lg text-gray-300 hover:text-blue-400 hover:bg-blue-500/10 transition-colors border-2 border-transparent hover:border-blue-400"
              title="Rotate Page"
            >
              <RotateCw size={18} />
            </button>
            <button
              onClick={onDeletePage}
              disabled={totalPages <= 1}
              className="p-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-2 border-transparent hover:border-red-400"
              title="Delete Page"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={onClearPage}
              className="p-2 rounded-lg text-gray-300 hover:text-orange-400 hover:bg-orange-500/10 transition-colors border-2 border-transparent hover:border-orange-400"
              title="Clear Page Annotations"
            >
              <Eraser size={18} />
            </button>
          </div>


        </div>
      </div>

      {/* Secondary Toolbar - Tool Settings */}
      <div className="flex items-center justify-between gap-6 px-8 py-3 bg-gray-200 border-t border-gray-100 flex-wrap">
        {/* Color Picker */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Color:</span>
          <div className="flex gap-2 items-center">
            {presetColors.map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 hover:scale-125 shadow-sm ${
                  toolColor === color
                    ? "border-white shadow-md scale-110"
                    : "border-gray-600 hover:border-gray-400"
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}

            {/* Custom Color Picker */}
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="flex items-center gap-1 px-3 py-1.5 bg-black/80 border-2 border-gray-600 rounded-lg hover:border-gray-400 transition-colors"
                title="Custom Color"
              >
                <div
                  className="w-5 h-5 rounded border border-gray-500"
                  style={{ backgroundColor: toolColor }}
                />
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {showColorPicker && (
                <div className="absolute top-full mt-2 left-0 z-50 bg-black/90 rounded-xl shadow-xl border border-gray-600 p-3">
                  <HexColorPicker color={toolColor} onChange={onColorChange} />
                  <div className="mt-3 text-center">
                    <input
                      type="text"
                      value={toolColor}
                      onChange={(e) => onColorChange(e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-black/80 border border-gray-600 rounded font-mono text-center text-white"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
<div className="flex items-center gap-6">


        {/* Width/Size Controls */}
        {(selectedTool === "pen" ||
          selectedTool === "highlighter" ||
          selectedTool === "eraser" ||
          selectedTool === "line" ||
          selectedTool === "arrow" ||
          selectedTool === "rectangle" ||
          selectedTool === "circle") && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Width:</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={toolWidth}
                  onChange={(e) => onWidthChange(Number(e.target.value))}
                  className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="text-xs font-mono font-bold text-blue-400 min-w-[40px]">{toolWidth}px</span>
              </div>
            </div>
          )}

        {/* Font Size Control */}
        {selectedTool === "text" && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Size:</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="8"
                max="72"
                value={fontSize}
                onChange={(e) => onFontSizeChange(Number(e.target.value))}
                className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-xs font-mono font-bold text-blue-400 min-w-[40px]">{fontSize}px</span>
            </div>
          </div>
        )}
           {/* History Controls */}
          <div className="flex items-center gap-2 p-2 bg-black/80 rounded-2xl ">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-2 border-transparent hover:border-gray-400"
              title="Undo"
            >
              <Undo size={18} />
            </button>
            <div className="w-px h-6 bg-gray-500"></div>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-2 border-transparent hover:border-gray-400"
              title="Redo"
            >
              <Redo size={18} />
            </button>
          </div>
                    {/* Export */}
          {showExportButton && (
            <div
              onClick={onExport}
                 className="px-6 py-4 rounded-2xl gap-3 bg-black/80 flex text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-2 border-transparent hover:border-gray-400"
            
              title="Export PDF"
            >
              <Download size={18} />
              <span className="text-sm font-semibold hidden sm:inline">{exportButtonText}</span>
            </div>
          )}
          </div>
      </div>
    </div>
  );
};

export default PDFToolbar;
