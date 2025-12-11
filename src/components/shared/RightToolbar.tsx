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
  Eraser,
  Pentagon,
  Layers,
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
        relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 group
        ${active
          ? "bg-black/70 text-white shadow-md shadow-blue-200"
          : "bg-transparent text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm"
        }
      `}
      title={tooltip || label}
    >
      <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? "scale-100" : "group-hover:scale-110"}`} />

      {/* Tooltip on hover (side) */}
      <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        {tooltip || label}
      </span>
    </button>
  );
};

const ToolbarDivider = () => (
  <div className="w-8 h-[1px] bg-gray-200/60 my-1 mx-auto" />
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
}) => {
  return (
    <div
      className="
    pointer-events-auto 
    flex flex-col items-center 
    p-2 
    bg-white/40
    backdrop-blur-xl 
    border-2 border-white/80
    rounded-2xl 
    shadow-[0_8px_30px_rgba(0,0,0,0.20)]
    hover:bg-white/80 
    transition-all
  "
    >

      <div className="flex flex-col items-center gap-1">
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
          icon={Layers}
          label="overlay"
          activeTool={activeTool}
          onClick={() => setTool("overlay")}
          tooltip="Overlay Layers"
        />

        <ToolbarDivider />

        {/* Drawing & Annotation Tools */}
        <ToolButton
          icon={Pentagon}
          label="polygon"
          activeTool={activeTool}
          onClick={() => setTool("polygon")}
          tooltip="Polygon Area"
        />
        <ToolButton
          icon={SquareDashedMousePointer}
          label="annotate"
          activeTool={activeTool}
          onClick={() => {
            setTool("annotate");
            onAnnotate?.();
          }}
          tooltip="Box Detection"
        />
        <ToolButton
          icon={Pencil}
          label="markup"
          activeTool={activeTool}
          onClick={() => setTool("markup")}
          tooltip="Freehand Markup"
        />

        <ToolbarDivider />

        {/* Measurement Tools */}
        <ToolButton
          icon={Ruler}
          label="measure"
          activeTool={activeTool}
          onClick={() => {
            setTool("measure");
            onMeasure?.();
          }}
          tooltip="Calibrate Scale"
        />
        <ToolButton
          icon={Baseline}
          label="linear"
          activeTool={activeTool}
          onClick={() => setTool("linear")}
          tooltip="Linear Measure"
        />

        <ToolbarDivider />

        {/* Utility Tools */}
        <ToolButton
          icon={SlidersHorizontal}
          label="adjust"
          activeTool={activeTool}
          onClick={() => setTool("adjust")}
          tooltip="Image Adjustments"
        />
        <ToolButton
          icon={Eraser}
          label="erase"
          activeTool={activeTool}
          onClick={() => setTool("erase")}
          tooltip="Eraser"
        />
      </div>
    </div>
  );
};

export default RightToolbar;
