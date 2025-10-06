"use client";

import React, { useEffect, useRef, useState } from "react";

// Local fallback JSX typing to avoid requiring @types/react in this workspace.
// This keeps the TSX file usable in editors which may not have React type packages installed.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

type Detection = {
  class: string;
  bbox: [number, number, number, number]; // [x1,y1,x2,y2] in pixels (server coordinate)
  confidence: number;
  area?: number;
  segmentation?: number[][]; // Array of [x,y] points for segmentation mask
  detection_type?: string; // 'segmentation', 'fallback_yolo', etc.
};

type DetectResponse = {
  success: boolean;
  overlay_image?: string; // base64 data URI or pure base64
  detections?: Detection[];
  error?: string;
};

interface Props {
  // An object from your hook: { dataUrl, name, blob? }
  image: { dataUrl: string; name: string; blob?: Blob };
  // optional: the backend base URL if different from current origin
  serverBaseUrl?: string;
  // optional: elements to request (['door','window',...]) - passed to /detect-elements if provided
  elements?: string[];
  // optional callback
  onResult?: (r: DetectResponse) => void;
  // whether to auto-run detection
  autoDetect?: boolean;
}

// Helper: convert dataUrl (data:image/...) to a Blob (works in browsers)
async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  // fetch understands data: URIs in browsers and returns a Response we can .blob()
  const res = await fetch(dataUrl);
  return await res.blob();
}

export default function DetectOverlayPreview({
  image,
  serverBaseUrl,
  elements,
  onResult,
  autoDetect = true,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [overlay, setOverlay] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [naturalSize, setNaturalSize] = useState<{
    w: number;
    h: number;
  } | null>(null);
  const [showBoxes, setShowBoxes] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  // Helper: call the server with either FormData (file) or JSON (image URL)
  async function callDetect() {
    setLoading(true);
    setError(null);

    try {
      // Helper to parse response safely (handles 415/HTML errors)
      async function parseResponse(resp: Response) {
        const ct = resp.headers.get("content-type") || "";
        const txt = await resp.text();
        if (ct.includes("application/json")) {
          try {
            return JSON.parse(txt) as DetectResponse;
          } catch (e) {
            throw new Error(
              `Failed to parse JSON response: ${e} -- raw: ${txt}`
            );
          }
        }
        // not JSON
        throw new Error(`Non-JSON response (status ${resp.status}): ${txt}`);
      }

      const base =
        serverBaseUrl ||
        (window.location.origin as string) ||
        "http://127.0.0.1:5000";
      // Always call /detect-blueprint which accepts file uploads or an image_url
      // We send `elements` as either a form field (when using FormData) or in JSON
      const url = `${base}/detect-blueprint`;

      let respJson: DetectResponse | null = null;

      // If we have a blob directly, send multipart form data (file)
      if (image.blob) {
        const fd = new FormData();
        fd.append("file", new File([image.blob], image.name || "upload.png"));
        if (elements && elements.length)
          fd.append("elements", JSON.stringify(elements));
        const r = await fetch(url, { method: "POST", body: fd });
        respJson = await parseResponse(r);
      } else if (image.dataUrl && image.dataUrl.startsWith("data:")) {
        // data: URI — convert to blob and send as form-data (server does not accept data: URLs)
        const blob = await dataUrlToBlob(image.dataUrl);
        const fileName = image.name || "blueprint.png";
        const file = new File([blob], fileName, {
          type: blob.type || "image/png",
        });
        const fd = new FormData();
        fd.append("file", file);
        if (elements && elements.length)
          fd.append("elements", JSON.stringify(elements));

        const r = await fetch(url, { method: "POST", body: fd });
        respJson = await parseResponse(r);
      } else {
        // Assume it's an http(s) URL or other fetchable URL — let server download it
        const body =
          elements && elements.length
            ? { image_url: image.dataUrl, elements }
            : { image_url: image.dataUrl };
        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        try {
          respJson = await parseResponse(r);
        } catch (err) {
          // include status for easier debugging
          console.error("Detect request failed", {
            status: r.status,
            headers: [...r.headers],
            bodyPreview: await r.text(),
          });
          throw err;
        }
      }

      if (!respJson) throw new Error("No JSON response from server");

      if (respJson.success) {
        // overlay_image may be a data URI or plain base64
        let ov = respJson.overlay_image || null;
        if (ov && !ov.startsWith("data:")) {
          // assume PNG by default
          ov = `data:image/png;base64,${ov}`;
        }
        setOverlay(ov);
        setDetections(respJson.detections || []);
      } else {
        setError(respJson.error || "Detection failed");
        // still accept overlay or partial info
        if (respJson.overlay_image)
          setOverlay(
            respJson.overlay_image.startsWith("data:")
              ? respJson.overlay_image
              : `data:image/png;base64,${respJson.overlay_image}`
          );
        setDetections(respJson.detections || []);
      }

      onResult?.(respJson as DetectResponse);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  // auto-run when image changes
  useEffect(() => {
    setOverlay(null);
    setDetections([]);
    setError(null);
    if (autoDetect && image) {
      // small delay to let UI render
      void callDetect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, elements]);

  // draw boxes on canvas when detections or image size change
  useEffect(() => {
    if (!showBoxes || !canvasRef.current || !imgRef.current) return;

    const imgEl = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const naturalW = imgEl.naturalWidth || imgEl.width;
    const naturalH = imgEl.naturalHeight || imgEl.height;
    const displayW = imgEl.clientWidth;
    const displayH = imgEl.clientHeight;

    // size canvas to displayed size
    canvas.width = displayW;
    canvas.height = displayH;

    // clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = displayW / naturalW;
    const scaleY = displayH / naturalH;

    detections.forEach((d: Detection) => {
      const [x1, y1, x2, y2] = d.bbox;
      const w = x2 - x1;
      const h = y2 - y1;
      const sx = x1 * scaleX;
      const sy = y1 * scaleY;
      const sw = w * scaleX;
      const sh = h * scaleY;

      // Draw segmentation mask if available
      if (d.segmentation && d.segmentation.length > 2) {
        ctx.fillStyle = "rgba(0,150,255,0.2)";
        ctx.beginPath();
        d.segmentation.forEach(([x, y], idx) => {
          const scaledX = x * scaleX;
          const scaledY = y * scaleY;
          if (idx === 0) {
            ctx.moveTo(scaledX, scaledY);
          } else {
            ctx.lineTo(scaledX, scaledY);
          }
        });
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "rgba(0,150,255,0.9)";
        ctx.lineWidth = Math.max(
          2,
          Math.round(Math.min(displayW, displayH) * 0.002)
        );
        ctx.stroke();
      } else {
        // Draw bounding box
        ctx.strokeStyle = "rgba(0,150,255,0.9)";
        ctx.lineWidth = Math.max(
          2,
          Math.round(Math.min(displayW, displayH) * 0.002)
        );
        ctx.strokeRect(sx, sy, sw, sh);
      }

      ctx.fillStyle = "rgba(0,150,255,0.9)";
      ctx.font = "12px sans-serif";
      const label = `${d.class} ${(d.confidence * 100).toFixed(0)}%`;
      const padding = 4;
      const textWidth = ctx.measureText(label).width;
      const labelH = 16;
      ctx.fillRect(
        sx,
        sy - labelH - padding,
        textWidth + padding * 2,
        labelH + padding / 2
      );
      ctx.fillStyle = "#fff";
      ctx.fillText(label, sx + padding, sy - padding);
    });
  }, [detections, showBoxes]);

  // update natural size when image loads or changes
  useEffect(() => {
    const img: any = imgRef.current;
    if (!img) return;
    function onLoad() {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      setNaturalSize({ w, h });
    }
    // if already loaded
    if (img.complete) onLoad();
    img.addEventListener("load", onLoad);
    return () => img.removeEventListener("load", onLoad);
  }, [image.dataUrl]);

  // helper to render small SVG icon glyphs for certain classes
  function renderIcon(
    cls: string,
    cx: number,
    cy: number,
    bw: number,
    bh: number
  ) {
    const clsLower = (cls || "").toLowerCase();
    const scale = Math.max(0.6, Math.min(bw, bh) / 80);
    const tx = `translate(${cx - bw / 2}, ${cy - bh / 2}) scale(${scale})`;
    switch (clsLower) {
      case "bed":
        return React.createElement(
          "g",
          { transform: tx },
          React.createElement("rect", {
            x: 2,
            y: 10,
            width: 64,
            height: 36,
            rx: 4,
            fill: "#1f78b4",
          }),
          React.createElement("rect", {
            x: 6,
            y: 14,
            width: 20,
            height: 12,
            fill: "#a6cee3",
          })
        );
      case "door":
        return React.createElement(
          "g",
          { transform: tx },
          React.createElement("rect", {
            x: 10,
            y: 4,
            width: 44,
            height: 64,
            fill: "#33a02c",
            rx: 2,
          }),
          React.createElement("circle", { cx: 46, cy: 36, r: 3, fill: "#fff" })
        );
      case "window":
        return React.createElement(
          "g",
          { transform: tx },
          React.createElement("rect", {
            x: 6,
            y: 6,
            width: 56,
            height: 56,
            fill: "#ff7f00",
            rx: 2,
          }),
          React.createElement("line", {
            x1: 6,
            y1: 34,
            x2: 62,
            y2: 34,
            stroke: "#fff",
            strokeWidth: 4,
          }),
          React.createElement("line", {
            x1: 34,
            y1: 6,
            x2: 34,
            y2: 62,
            stroke: "#fff",
            strokeWidth: 4,
          })
        );
      case "kitchen":
      case "kitchenette":
        return React.createElement(
          "g",
          { transform: tx },
          React.createElement("rect", {
            x: 6,
            y: 10,
            width: 56,
            height: 24,
            fill: "#6a3d9a",
            rx: 3,
          }),
          React.createElement("rect", {
            x: 10,
            y: 16,
            width: 12,
            height: 12,
            fill: "#fff",
          }),
          React.createElement("rect", {
            x: 26,
            y: 16,
            width: 12,
            height: 12,
            fill: "#fff",
          })
        );
      case "room":
        // small unobtrusive room marker instead of large translucent shapes
        const s = Math.max(0.6, Math.min(bw, bh) / 80);
        return React.createElement(
          "g",
          {
            transform: `translate(${cx - bw / 2}, ${cy - bh / 2}) scale(${s})`,
          },
          React.createElement("rect", {
            x: 20,
            y: 20,
            width: 40,
            height: 28,
            rx: 6,
            fill: "#e31a1a",
            opacity: 0.14,
          }),
          React.createElement(
            "text",
            {
              x: 40,
              y: 38,
              fill: "#e31a1a",
              fontSize: 10,
              textAnchor: "middle",
              style: { fontFamily: "sans-serif" },
            },
            "room"
          )
        );
      default:
        return null;
    }
  }

  return (
    <div className="detect-preview">
      <div className="controls mb-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setShowOverlay((s: boolean) => !s);
          }}
          className="px-3 py-1 bg-gray-100 rounded"
        >
          {showOverlay ? "Hide overlay" : "Show overlay"}
        </button>

        <button
          type="button"
          onClick={() => setShowBoxes((s: boolean) => !s)}
          className="px-3 py-1 bg-gray-100 rounded"
        >
          {showBoxes ? "Hide boxes" : "Show boxes"}
        </button>

        <button
          type="button"
          onClick={() => void callDetect()}
          disabled={loading}
          className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-60"
        >
          {loading ? "Detecting..." : "Run detection"}
        </button>

        {error && <div className="text-red-600 ml-2">{error}</div>}
      </div>

      <div style={{ position: "relative", display: "inline-block" }}>
        <img
          ref={imgRef}
          src={image.dataUrl}
          alt={image.name}
          style={{
            display: "block",
            maxWidth: "640px",
            width: "100%",
            height: "auto",
          }}
        />

        {/* overlay image from server (if present) */}
        {overlay && showOverlay && (
          <img
            src={overlay}
            alt="overlay"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              mixBlendMode: "normal",
            }}
          />
        )}

        {/* SVG overlay for detections (scales with image via viewBox) */}
        {showBoxes && naturalSize && detections && detections.length > 0 && (
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${naturalSize.w} ${naturalSize.h}`}
            preserveAspectRatio="xMinYMin meet"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              pointerEvents: "none",
            }}
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* background group */}
            <g>
              {detections.map((d: Detection, i: number) => {
                const [x1, y1, x2, y2] = d.bbox;
                const w = x2 - x1;
                const h = y2 - y1;
                const cls = (d.class || "").toLowerCase();
                const colors: Record<string, string> = {
                  room: "#e31a1a",
                  bedroom: "#1f78b4",
                  bed: "#1f78b4",
                  door: "#33a02c",
                  window: "#ff7f00",
                  kitchen: "#6a3d9a",
                  bathroom: "#0fb9b1",
                  living_room: "#fb9a99",
                  dining_room: "#fdbf6f",
                  stairs: "#cab2d6",
                  wall: "#666666",
                  toilet: "#87ceeb",
                  sink: "#9370db",
                  sofa: "#ff69b4",
                  table: "#daa520",
                  chair: "#8fbc8f",
                  cabinet: "#cd853f",
                  appliance: "#d2691e",
                  fixture: "#4682b4",
                  entrance: "#00ced1",
                  balcony: "#98fb98",
                  default: "#888",
                };
                const color = colors[cls] || colors.default;
                const confidence = d.confidence || 0;
                const detectionType = d.detection_type || "unknown";
                const label = `${d.class} ${(confidence * 100).toFixed(0)}%`;
                const labelW = Math.min(Math.max(label.length * 7, 40), 220);
                const labelH = 18;
                const labelX = x1;
                const labelY = Math.max(y1 - labelH - 4, 4);

                return (
                  <g key={`d-${i}`}>
                    {/* Render segmentation mask if available */}
                    {d.segmentation && d.segmentation.length > 2 ? (
                      <>
                        {/* Segmentation polygon with semi-transparent fill */}
                        <polygon
                          points={d.segmentation
                            .map(([x, y]) => `${x},${y}`)
                            .join(" ")}
                          fill={color}
                          fillOpacity={0.3}
                          stroke={color}
                          strokeWidth={Math.max(
                            2,
                            Math.round(
                              Math.min(naturalSize.w, naturalSize.h) * 0.002
                            )
                          )}
                        />
                        {/* Add a small indicator that this is a segmentation */}
                        <circle
                          cx={x1 + w - 8}
                          cy={y1 + 8}
                          r={3}
                          fill={color}
                          opacity={0.8}
                        />
                        <text
                          x={x1 + w - 8}
                          y={y1 + 8}
                          fontSize={8}
                          fill="#fff"
                          textAnchor="middle"
                          dominantBaseline="central"
                          style={{
                            fontFamily: "sans-serif",
                            fontWeight: "bold",
                          }}
                        >
                          S
                        </text>
                      </>
                    ) : (
                      /* Fallback to bounding box */
                      <rect
                        x={x1}
                        y={y1}
                        width={w}
                        height={h}
                        fill="none"
                        stroke={color}
                        strokeWidth={Math.max(
                          2,
                          Math.round(
                            Math.min(naturalSize.w, naturalSize.h) * 0.002
                          )
                        )}
                      />
                    )}

                    {/* Label background */}
                    <rect
                      x={labelX}
                      y={labelY}
                      width={labelW}
                      height={labelH}
                      rx={3}
                      ry={3}
                      fill={color}
                      opacity={0.9}
                    />

                    {/* Label text */}
                    <text
                      x={labelX + 6}
                      y={labelY + labelH - 6}
                      fontSize={12}
                      fill="#fff"
                      style={{ fontFamily: "sans-serif" }}
                    >
                      {label}
                    </text>

                    {/* Detection type indicator */}
                    {detectionType === "segmentation" && (
                      <text
                        x={labelX + labelW - 16}
                        y={labelY + labelH - 6}
                        fontSize={8}
                        fill="#fff"
                        style={{ fontFamily: "sans-serif", opacity: 0.8 }}
                      >
                        SEG
                      </text>
                    )}

                    {/* render icon centered in bbox */}
                    {renderIcon(d.class, x1 + w / 2, y1 + h / 2, w, h)}
                  </g>
                );
              })}
            </g>
          </svg>
        )}
      </div>

      {/* summary list */}
      <div className="mt-2 text-sm">
        <div>Detections: {detections.length}</div>
        <ul>
          {detections.map((d: Detection, idx: number) => (
            <li key={idx}>
              {d.class} — {(d.confidence * 100).toFixed(1)}% — bbox:{" "}
              {d.bbox.map((n: number) => Math.round(n)).join(",")}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
