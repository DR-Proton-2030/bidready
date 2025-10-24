"use client";
import React from "react";
import {
  MousePointer,
  Hand,
  SquareDashedMousePointer,
  Copy,
  Baseline,
  Ruler,
  Pencil,
  SlidersHorizontal,
  Search,
  Layers,
  Download,
  Share2,
  BookOpen,
  Calculator,
  Grid3x3,
  MapPin,
  Scissors,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Palette,
  Type,
  Circle,
  Square,
  Triangle,
  Eraser,
} from "lucide-react";

interface ToolButtonProps {
  icon: React.ComponentType<any>;
  label: string;
  activeTool?: string;
  onClick: () => void;
  isActive?: boolean;
  tooltip?: string;
}

const ToolButton: React.FC<ToolButtonProps> = ({
  icon: Icon,
  label,
  activeTool,
  onClick,
  isActive,
  tooltip,
}) => {
  const active = isActive || activeTool === label;

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center w-10 h-10 rounded-md transition-all duration-200 group
        ${
          active
            ? "bg-blue-500 text-white shadow-sm"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }
      `}
      title={tooltip || label}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
};

const ToolbarDivider = () => (
  <div className="w-6 h-px bg-gray-300 my-2 mx-auto" />
);

interface RightToolbarProps {
  activeTool: string;
  setTool: (tool: string) => void;
  onAnnotate?: () => void;
  onMeasure?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onToggleGrid?: () => void;
  onAddNote?: () => void;
  onCalculate?: () => void;
  showGrid?: boolean;
  className?: string;
}

const RightToolbar: React.FC<RightToolbarProps> = ({
  activeTool,
  setTool,
  onAnnotate,
  onMeasure,
  onDownload,
  onShare,
  onToggleGrid,
  onAddNote,
  onCalculate,
  showGrid = false,
  className = "",
}) => {
  return (
    <aside
      className={`flex-shrink-0 flex flex-col items-center w-16 py-4 bg-white bg-opacity-95 backdrop-blur-sm border-gray-200 shadow-lg ${className}`}
    >
      <div className="flex flex-col items-center space-y-2">
        {/* Selection Tools */}
        <ToolButton
          icon={MousePointer}
          label="select"
          activeTool={activeTool}
          onClick={() => setTool("select")}
          tooltip="Select"
        />
        <ToolButton
          icon={Hand}
          label="pan"
          activeTool={activeTool}
          onClick={() => setTool("pan")}
          tooltip="Pan"
        />
        <ToolButton
          icon={SquareDashedMousePointer}
          label="annotate"
          activeTool={activeTool}
          onClick={() => {
            setTool("annotate");
            onAnnotate?.();
          }}
          tooltip="Annotate Objects"
        />
        <ToolButton
          icon={Copy}
          label="copy"
          activeTool={activeTool}
          onClick={() => setTool("copy")}
          tooltip="Copy"
        />

        <ToolbarDivider />

        {/* Measurement Tools */}
        <ToolButton
          icon={Baseline}
          label="linear"
          activeTool={activeTool}
          onClick={() => setTool("linear")}
          tooltip="Linear Measure"
        />
        <ToolButton
          icon={Ruler}
          label="measure"
          activeTool={activeTool}
          onClick={() => {
            setTool("measure");
            onMeasure?.();
          }}
          tooltip="Measure"
        />

        <ToolbarDivider />

        {/* Drawing Tools */}
        <ToolButton
          icon={Pencil}
          label="markup"
          activeTool={activeTool}
          onClick={() => {
            setTool("markup");
            onAnnotate?.();
          }}
          tooltip="Markup"
        />

        {/* Erase annotations */}
        <ToolButton
          icon={Eraser}
          label="erase"
          activeTool={activeTool}
          onClick={() => setTool("erase")}
          tooltip="Erase Annotations"
        />

        <ToolbarDivider />

        {/* Actions */}
        <ToolButton
          icon={SlidersHorizontal}
          label="adjust"
          activeTool={activeTool}
          onClick={() => setTool("adjust")}
          tooltip="Adjust"
        />
        <ToolButton
          icon={Search}
          label="search"
          activeTool={activeTool}
          onClick={() => setTool("search")}
          tooltip="Search"
        />
      </div>
    </aside>
  );
};

export default RightToolbar;
