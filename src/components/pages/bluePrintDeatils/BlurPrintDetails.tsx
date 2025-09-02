"use client";
import React, { useState } from "react";
import LeftToolbar from "./LeftToolbar";
import TopBar from "./TopBar";
import BlueprintViewer from "./BlueprintViewer";
import RightPanel from "./RightPanel";

const BlueprintDetails = () => {
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

  return (
    <div className="flex h-[89vh] bg-gray-50 font-sans overflow-hidden">
      <LeftToolbar activeTool={tool} setTool={setTool} />
      <main className="flex-1 flex flex-col">
        <TopBar onToggleRightPanel={() => setIsRightPanelOpen((s) => !s)} />
        <BlueprintViewer
          tool={tool}
          scale={scale}
          position={position}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        />
      </main>
      <RightPanel isOpen={isRightPanelOpen} />
    </div>
  );
};

export default BlueprintDetails;
