"use client";

import React, { useEffect, useMemo, useState } from "react";
import FullScreenImageViewer from "../../components/shared/FullScreenImageViewer";

const DetectionPage: React.FC = () => {
  const [payload, setPayload] = useState<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const data = params.get("data");
    if (!data) return;
    try {
      const parsed = JSON.parse(decodeURIComponent(data));
      setPayload(parsed);
      // log to console as requested
      // eslint-disable-next-line no-console
      console.log("Detection payload:", parsed);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to parse detection data", err);
    }
  }, []);

  const images = useMemo(() => {
    if (!payload || !payload.file_url) return [];
    const id = payload.id ?? payload.svg_overlay_url?.inference_id ?? String(Date.now());
    const name = payload.file_url.split("/").pop() ?? "image";
    return [
      {
        id,
        name,
        path: payload.file_url,
      },
    ];
  }, [payload]);

  // The detectionResults prop expects an object with predictions, etc.
  const detectionResults = payload?.svg_overlay_url ?? null;

  if (!payload) {
    return (
      <div className="p-6 bg-white min-h-screen">
        <h1 className="text-2xl font-semibold mb-4">Detection Details</h1>
        <p className="text-gray-500">No detection data found in the URL.</p>
      </div>
    );
  }

  return (
    <FullScreenImageViewer
      images={images}
      initialIndex={0}
      isOpen={true}
      onClose={() => window.history.back()}
      onImageChange={() => {}}
      detectionResults={detectionResults}
      onSvgOverlayUpdate={(imageId: string, svgData: string | null) => {
        // keep a console log for debugging; consumers can persist svgData if needed
        // eslint-disable-next-line no-console
        console.log("onSvgOverlayUpdate", imageId, svgData);
      }}
    />
  );
};

export default DetectionPage;
