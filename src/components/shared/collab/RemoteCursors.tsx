"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PeerPresence } from "@/@types/collab/collab.types";

interface RemoteCursorsProps {
  presence: Record<string, PeerPresence>;
  imageDimensions: { width: number; height: number };
  zoom: number;
  rotation: number;
  imagePosition: { x: number; y: number };
}

/** Cursors idle for longer than this fade out rather than lingering. */
const IDLE_FADE_MS = 15000;

/**
 * Renders remote peers' cursors and in-progress shapes.
 *
 * Sits in the same coordinate space as the viewer's other overlays — an SVG
 * with `viewBox="0 0 imageW imageH"` carrying the image's transform — so
 * positions line up with drawn annotations without any extra maths.
 */
export const RemoteCursors: React.FC<RemoteCursorsProps> = ({
  presence,
  imageDimensions,
  zoom,
  rotation,
  imagePosition,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  /** CSS pixels per SVG user unit, before the zoom transform is applied. */
  const [unitScale, setUnitScale] = useState(1);
  const [, forceTick] = useState(0);

  // The overlay's parent is untransformed, so its box gives us the letterboxed
  // render ratio without having to reason about the zoom/rotate transform.
  useLayoutEffect(() => {
    const parent = svgRef.current?.parentElement;
    if (!parent || !imageDimensions.width || !imageDimensions.height) return;

    const measure = () => {
      const rect = parent.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      setUnitScale(
        Math.min(
          rect.width / imageDimensions.width,
          rect.height / imageDimensions.height,
        ),
      );
    };

    measure();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [imageDimensions.width, imageDimensions.height]);

  // Re-render periodically so idle cursors actually fade out.
  useEffect(() => {
    const entries = Object.values(presence);
    if (!entries.some((entry) => entry.point)) return;

    const timer = setInterval(() => forceTick((n) => n + 1), 2000);
    return () => clearInterval(timer);
  }, [presence]);

  if (!imageDimensions.width || !imageDimensions.height) return null;

  const entries = Object.values(presence);
  if (entries.length === 0) return null;

  // Counter-scale glyphs so cursors stay a constant size on screen at any zoom.
  const glyphScale = 1 / Math.max(unitScale * zoom, 0.0001);
  const now = Date.now();

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        width: "100%",
        height: "100%",
        transform: `scale(${zoom}) rotate(${rotation}deg) translate(${imagePosition.x / zoom}px, ${imagePosition.y / zoom}px)`,
        transformOrigin: "center center",
        zIndex: 20,
      }}
      viewBox={`0 0 ${imageDimensions.width} ${imageDimensions.height}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {entries.map(({ peer, point, draft, updatedAt }) => {
        const color = peer.user.color || "#2563eb";
        const stale = now - updatedAt > IDLE_FADE_MS;

        return (
          <g key={peer.clientId}>
            {/* In-progress shape the peer is currently drawing */}
            {draft?.tool === "annotate" && (
              <rect
                x={draft.rect.x}
                y={draft.rect.y}
                width={draft.rect.width}
                height={draft.rect.height}
                fill={color}
                fillOpacity={0.12}
                stroke={color}
                strokeWidth={2}
                strokeDasharray="8 6"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {draft?.tool === "polygon" && draft.points.length > 0 && (
              <>
                <polyline
                  points={draft.points.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  strokeDasharray="8 6"
                  vectorEffect="non-scaling-stroke"
                />
                {draft.points.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={4 * glyphScale}
                    fill={color}
                  />
                ))}
              </>
            )}

            {draft?.tool === "measure" && (
              <line
                x1={draft.start.x}
                y1={draft.start.y}
                x2={draft.end.x}
                y2={draft.end.y}
                stroke={color}
                strokeWidth={2}
                strokeDasharray="8 6"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {/* Cursor pointer + name tag */}
            {point && !stale && (
              <g
                transform={`translate(${point.x} ${point.y}) scale(${glyphScale})`}
                style={{ transition: "opacity 200ms" }}
              >
                <path
                  d="M0 0 L0 16 L4.5 12 L7.5 18.5 L10.5 17 L7.5 11 L13 11 Z"
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth={1.25}
                  strokeLinejoin="round"
                />
                <g transform="translate(14 16)">
                  <rect
                    x={0}
                    y={0}
                    rx={4}
                    ry={4}
                    width={Math.max(28, peer.user.name.length * 6.6 + 12)}
                    height={18}
                    fill={color}
                  />
                  <text
                    x={6}
                    y={13}
                    fill="#ffffff"
                    fontSize={11}
                    fontWeight={600}
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {peer.user.name}
                  </text>
                </g>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};

export default RemoteCursors;
