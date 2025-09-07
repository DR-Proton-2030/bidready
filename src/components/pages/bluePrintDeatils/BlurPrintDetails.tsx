/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import LeftToolbar from "./LeftToolbar";
import TopBar from "./TopBar";
import BlueprintViewer from "./BlueprintViewer";
import RightPanel from "./RightPanel";

const BlueprintDetails = ({ blueprintDetails }: any) => {
  const [tool, setTool] = useState("select");
  const [scale, setScale] = useState(0.8);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  type Annotation = { type: string; points: Array<{ x: number; y: number }> };
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [, setRedoStack] = useState<Annotation[]>([]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (tool === "pan") {
      setDragging(true);
      setStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
    // Start an annotation for area/measure/markup
    if (tool === "area" || tool === "measure" || tool === "markup") {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = (e.clientX - rect.left - position.x) / scale;
      const y = (e.clientY - rect.top - position.y) / scale;
      setAnnotations((prev) => [...prev, { type: tool, points: [{ x, y }] }]);
      // clear redo stack on new action
      setRedoStack([]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (tool === "pan" && dragging) {
      setPosition({
        x: e.clientX - start.x,
        y: e.clientY - start.y,
      });
    }
    // Update last annotation with current point
    if (
      (tool === "area" || tool === "measure" || tool === "markup") &&
      annotations.length > 0
    ) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = (e.clientX - rect.left - position.x) / scale;
      const y = (e.clientY - rect.top - position.y) / scale;
      setAnnotations((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last) {
          last.points = [...(last.points || []), { x, y }];
        }
        return copy;
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

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.1, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.1, 0.1));

  const handleUndo = () => {
    setAnnotations((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const last = copy.pop() as Annotation;
      setRedoStack((r) => [...r, last]);
      return copy;
    });
  };

  const handleRedo = () => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const item = copy.pop() as Annotation | undefined;
      if (item) {
        setAnnotations((a) => [...a, item]);
      }
      return copy;
    });
  };

  return (
    <div className="flex h-[89vh] bg-gray-50 font-sans overflow-hidden">
      <LeftToolbar
        activeTool={tool}
        setTool={setTool}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />
      <main className="flex-1 flex flex-col">
        <TopBar
          onToggleRightPanel={() => setIsRightPanelOpen((s) => !s)}
          blueprintDetails={blueprintDetails}
        />
        <BlueprintViewer
          tool={tool}
          scale={scale}
          position={position}
          annotations={annotations}
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
