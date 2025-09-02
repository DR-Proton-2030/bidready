"use client";
import React from "react";
import ToolButton from "./ToolButton";
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
  ZoomIn,
  ZoomOut,
} from "lucide-react";

const ToolbarDivider = () => (
  <div className="w-8 h-px bg-gray-200 my-2 mx-auto" />
);

interface LeftToolbarProps {
  activeTool: string;
  setTool: (t: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

const LeftToolbar: React.FC<LeftToolbarProps> = ({
  activeTool,
  setTool,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
}) => {
  return (
    <aside className="flex-shrink-0 flex flex-col items-center w-20 py-4 bg-white border-r border-gray-200">
      <div className="flex flex-col items-center space-y-2">
        <ToolButton
          icon={ZoomIn}
          label="zoom-in"
          activeTool={activeTool}
          onClick={() => onZoomIn && onZoomIn()}
        />
        <ToolButton
          icon={ZoomOut}
          label="zoom-out"
          activeTool={activeTool}
          onClick={() => onZoomOut && onZoomOut()}
        />
        <ToolButton
          icon={MousePointer}
          label="select"
          activeTool={activeTool}
          onClick={() => setTool("select")}
        />
        <ToolButton
          icon={Hand}
          label="pan"
          activeTool={activeTool}
          onClick={() => setTool("pan")}
        />
        <ToolButton
          icon={SquareDashedMousePointer}
          label="area"
          activeTool={activeTool}
          onClick={() => setTool("area")}
        />
        <ToolButton
          icon={Copy}
          label="copy"
          activeTool={activeTool}
          onClick={() => setTool("copy")}
        />
        <ToolButton
          icon={Baseline}
          label="linear"
          activeTool={activeTool}
          onClick={() => setTool("linear")}
        />
        <ToolButton
          icon={Ruler}
          label="measure"
          activeTool={activeTool}
          onClick={() => setTool("measure")}
        />
        <ToolbarDivider />
        <ToolButton
          icon={Pencil}
          label="markup"
          activeTool={activeTool}
          onClick={() => setTool("markup")}
        />
        <ToolbarDivider />
        <ToolButton icon={Undo2} label="Undo" onClick={onUndo} />
        <ToolButton icon={Redo2} label="Redo" onClick={onRedo} />
        <ToolButton
          icon={SlidersHorizontal}
          label="adjust"
          activeTool={activeTool}
          onClick={() => setTool("adjust")}
        />
        <ToolButton
          icon={Search}
          label="search"
          activeTool={activeTool}
          onClick={() => setTool("search")}
        />
      </div>
    </aside>
  );
};

export default LeftToolbar;
