"use client";
import React from "react";
import Image from "next/image";

interface ViewerProps {
  tool: string;
  scale: number;
  position: { x: number; y: number };
  annotations?: { type: string; points: Array<{ x: number; y: number }> }[];
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onWheel: (e: React.WheelEvent) => void;
}

const BlueprintViewer: React.FC<ViewerProps> = ({
  tool,
  scale,
  position,
  annotations = [],
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
        {/* SVG overlay to render annotations */}
        <svg
          width={1200}
          height={800}
          className="absolute top-0 left-0 pointer-events-none"
        >
          {annotations.map(
            (
              a: { type: string; points: Array<{ x: number; y: number }> },
              idx: number
            ) => {
              if (a.type === "markup" || a.type === "copy") {
                // polyline for freehand pen/markup
                const points = (a.points || [])
                  .map((p) => `${p.x},${p.y}`)
                  .join(" ");
                return (
                  <polyline
                    key={idx}
                    points={points}
                    fill="none"
                    stroke="#ff6b6b"
                    strokeWidth={2}
                  />
                );
              }
              if (a.type === "area") {
                const p0 = a.points[0];
                const p1 = a.points[a.points.length - 1] || p0;
                const x = Math.min(p0.x, p1.x);
                const y = Math.min(p0.y, p1.y);
                const w = Math.abs((p1.x || 0) - (p0.x || 0));
                const h = Math.abs((p1.y || 0) - (p0.y || 0));
                return (
                  <rect
                    key={idx}
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill="rgba(66,153,225,0.15)"
                    stroke="#4299e1"
                  />
                );
              }
              if (a.type === "measure") {
                const p0 = a.points[0];
                const p1 = a.points[a.points.length - 1] || p0;
                return (
                  <g key={idx}>
                    <line
                      x1={p0.x}
                      y1={p0.y}
                      x2={p1.x}
                      y2={p1.y}
                      stroke="#2b6cb0"
                      strokeWidth={2}
                    />
                    <text
                      x={(p0.x + p1.x) / 2}
                      y={(p0.y + p1.y) / 2 - 6}
                      fill="#2b6cb0"
                      fontSize={12}
                      textAnchor="middle"
                    >
                      {Math.round(
                        Math.hypot(p1.x - p0.x || 0, p1.y - p0.y || 0)
                      )}{" "}
                      px
                    </text>
                  </g>
                );
              }
              return null;
            }
          )}
        </svg>
      </div>
    </div>
  );
};

export default BlueprintViewer;
