"use client";
import React, { useState } from "react";
import {
  MousePointer,
  Hand,
  SquareDashedMousePointer,
  Copy,
  Baseline,
  Ruler,
  Pencil,
  Undo2,
  Redo2,
  SlidersHorizontal,
  Search,
  PanelLeft,
  Settings,
  Share2,
  ChevronDown,
  File,
  Printer,
  FileText,
} from "lucide-react";

// A reusable divider component for the toolbar
const ToolbarDivider = () => (
  <div className="w-8 h-px bg-gray-200 my-2 mx-auto" />
);

export const BlueprintDetails = () => {
  const [tool, setTool] = useState("select");
  const [scale, setScale] = useState(0.8);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (tool === "pan") {
      setDragging(true);
      setStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (tool === "pan" && dragging) {
      setPosition({
        x: e.clientX - start.x,
        y: e.clientY - start.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const scaleAmount = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((prev) => Math.min(Math.max(prev + scaleAmount, 0.1), 3));
  };

  // Reusable button component for the toolbar
  const ToolButton = ({
    icon: Icon,
    label,
    activeTool,
    onClick,
  }: {
    icon: React.ElementType;
    label: string;
    activeTool?: string;
    onClick?: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`flex items-center justify-center w-12 h-12 rounded-lg transition-colors ${
        activeTool === label
          ? "bg-primary text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
      title={label.charAt(0).toUpperCase() + label.slice(1)}
    >
      <Icon className="w-6 h-6" />
    </button>
  );

  return (
    <div className="flex h-[89vh] bg-gray-50 font-sans">
      {/* Left Vertical Toolbar - Updated with all new icons and grouping */}
      <aside className="flex flex-col items-center w-20 py-4 bg-white border-r border-gray-200">
        <div className="flex flex-col items-center space-y-2">
          {/* Group 1 */}
          <ToolButton
            icon={MousePointer}
            label="select"
            activeTool={tool}
            onClick={() => setTool("select")}
          />
          <ToolButton
            icon={Hand}
            label="pan"
            activeTool={tool}
            onClick={() => setTool("pan")}
          />
          <ToolButton
            icon={SquareDashedMousePointer}
            label="area"
            activeTool={tool}
            onClick={() => setTool("area")}
          />
          <ToolButton
            icon={Copy}
            label="copy"
            activeTool={tool}
            onClick={() => setTool("copy")}
          />
          <ToolButton
            icon={Baseline}
            label="linear"
            activeTool={tool}
            onClick={() => setTool("linear")}
          />
          <ToolButton
            icon={Ruler}
            label="measure"
            activeTool={tool}
            onClick={() => setTool("measure")}
          />

          <ToolbarDivider />

          {/* Group 2 */}
          <ToolButton
            icon={Pencil}
            label="markup"
            activeTool={tool}
            onClick={() => setTool("markup")}
          />

          <ToolbarDivider />

          {/* Group 3 */}
          <ToolButton icon={Undo2} label="Undo" />
          <ToolButton icon={Redo2} label="Redo" />
          <ToolButton
            icon={SlidersHorizontal}
            label="adjust"
            activeTool={tool}
            onClick={() => setTool("adjust")}
          />
          <ToolButton
            icon={Search}
            label="search"
            activeTool={tool}
            onClick={() => setTool("search")}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-800">My Project</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <File className="w-4 h-4" />
              <span>First Floor Plan</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600">
              <span className="text-lg">AI</span>
              <span>Run Takeoff</span>
            </button>
            <button className="p-2 text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200">
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
              className="p-2 text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <PanelLeft className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Blueprint Viewer */}
        <div
          className="flex-1 overflow-hidden bg-gray-100 relative"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        >
          <img
            src="https://cdn.shopify.com/s/files/1/0387/9521/files/House_Plans.jpg?9601269751775392317"
            alt="Blueprint"
            className="transform-origin-center absolute"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: dragging ? "none" : "transform 0.1s ease-out",
              cursor:
                tool === "pan" ? (dragging ? "grabbing" : "grab") : "default",
            }}
          />
        </div>
      </main>

      {/* Right Collapsible Panel */}
      <aside
        className={`w-80 bg-white border-l border-gray-200 transition-transform duration-300 ease-in-out ${
          isRightPanelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Quantities</h2>
            <div className="flex space-x-2">
              <button className="p-2 text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200">
                <Printer className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200">
                <FileText className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="font-semibold text-gray-700">Walls</p>
                <p className="text-sm text-gray-500">1,250 sq ft</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="font-semibold text-gray-700">Doors</p>
                <p className="text-sm text-gray-500">12 units</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="font-semibold text-gray-700">Windows</p>
                <p className="text-sm text-gray-500">15 units</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
