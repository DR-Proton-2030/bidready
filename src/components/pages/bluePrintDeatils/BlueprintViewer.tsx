"use client";
import React from "react";
import Image from "next/image";

interface ViewerProps {
  tool: string;
  scale: number;
  position: { x: number; y: number };
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onWheel: (e: React.WheelEvent) => void;
}

const BlueprintViewer: React.FC<ViewerProps> = ({
  tool,
  scale,
  position,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onWheel,
}) => {
  const src =
    "https://cdn.shopify.com/s/files/1/0387/9521/files/House_Plans.jpg?9601269751775392317";

  return (
    <div
      className="flex-1 overflow-hidden bg-gray-100 relative z-10"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onWheel={onWheel}
    >
      <div
        style={
          {
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: "transform 0.1s ease-out",
            cursor: tool === "pan" ? "grab" : "default",
          } as React.CSSProperties
        }
        className="absolute"
      >
        <Image src={src} alt="Blueprint" width={1200} height={800} priority />
      </div>
    </div>
  );
};

export default BlueprintViewer;
