/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

interface ViewerProps {
  tool: string;
  scale: number;
  images: any;
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
  images,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageSrcs, setImageSrcs] = useState<string[]>([]);

  // Build an array of image src strings. Support string URLs, objects with
  // a `url` field, or objects with a `blob` (Blob) field. For blobs we create
  // object URLs and revoke them on cleanup.
  useEffect(() => {
    if (!images) {
      setImageSrcs([]);
      return;
    }

    const createdUrls: string[] = [];
    const srcs: string[] = [];

    if (Array.isArray(images)) {
      images.forEach((it: any) => {
        if (!it) return;
        if (typeof it === "string") {
          srcs.push(it);
        } else if (typeof it === "object") {
          if (it.url && typeof it.url === "string") {
            srcs.push(it.url);
          } else if (it.blob instanceof Blob) {
            const url = URL.createObjectURL(it.blob);
            createdUrls.push(url);
            srcs.push(url);
          } else if (it.path && typeof it.path === "string") {
            // sometimes server returns { path: '/uploads/...'}
            srcs.push(it.path);
          }
        }
      });
    } else if (typeof images === "string") {
      srcs.push(images);
    }

    setImageSrcs(srcs);
    setCurrentIndex(0);

    return () => {
      // revoke any object URLs we created
      createdUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [images]);

  const total = imageSrcs.length;

  const prev = () => {
    setCurrentIndex((i) => (total === 0 ? 0 : (i - 1 + total) % total));
  };

  const next = () => {
    setCurrentIndex((i) => (total === 0 ? 0 : (i + 1) % total));
  };

  const src =
    imageSrcs[currentIndex] ||
    "https://cdn.shopify.com/s/files/1/0387/9521/files/House_Plans.jpg?9601269751775392317";

  return (
    <div
      className="flex-1 overflow-hidden bg-gray-100 relative z-10 "
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
        <div className="relative">
          <Image
            src={src}
            alt={`Blueprint ${currentIndex + 1}`}
            width={1200}
            height={500}
            priority
          />

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow"
              >
                ◀
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next image"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow"
              >
                ▶
              </button>
              <div className="absolute right-3 bottom-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                {currentIndex + 1} / {total}
              </div>
            </>
          )}
        </div>
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
