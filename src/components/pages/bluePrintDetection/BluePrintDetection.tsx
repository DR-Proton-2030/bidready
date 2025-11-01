"use client";
import React, { useState } from "react";
import useBlueprintImages, { BlueprintImage } from "../../../hooks/useBlueprintImages";
import useDeleteBlueprintImage from "../../../hooks/useDeleteBlueprintImage";
import { Trash, Trash2, Trash2Icon } from "lucide-react";
import ImageCard from "../../shared/imagecard/ImageCard";
import OverviewPanel from "@/components/shared/overviewPanel/OverviewPanel";
import FullScreenImageViewer from "@/components/shared/FullScreenImageViewer";
import Loader from "@/components/shared/loader/Loader";

const BluePrintDetection: React.FC<{ id?: string }> = ({ id: propId }) => {
  const { images, loading, error, refetch } = useBlueprintImages(propId ?? null);
  const { deleteImage, loading: deleting, error: deleteError } = useDeleteBlueprintImage();
  const [selected, setSelected] = useState<BlueprintImage | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState<Array<{ id: string; name: string; path: string }>>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [detectionResults, setDetectionResults] = useState<any | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [detectionCache] = useState<Map<string, any>>(() => new Map());
  const [detectedKeys, setDetectedKeys] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleProcessSelected = async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    setProcessing(true);
    setProcessedCount(0);
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const img = images.find((it) => it.id === id);
      if (!img || !img.url) {
        setProcessedCount((c) => c + 1);
        continue;
      }
      try {
        // run detection but don't open viewer for bulk
        await handleDetect(img.url, img.id, false);
      } catch (err) {
        console.error(`Bulk detect failed for ${id}`, err);
      } finally {
        setProcessedCount((c) => c + 1);
      }
    }
    setProcessing(false);
  };

  const handleDelete = (id: string) => {
    // call delete hook and refetch on success
    if (!confirm("Delete this image? This action cannot be undone.")) return;
    (async () => {
      try {
        await deleteImage(id);
        // refetch images after successful delete
        refetch();
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setSelected((s) => (s?.id === id ? null : s));
      } catch (err) {
        console.error("Failed to delete image", err);
        alert("Failed to delete image. See console for details.");
      }
    })();
  };

  const handleDetect = async (imageUrl: string, imageId?: string, openViewer = true) => {
    if (!imageUrl) return;
    const cacheKey = imageId ?? imageUrl;

    // If we have a cached result for this image (by id or url), use it and avoid API call
    if (cacheKey && detectionCache.has(cacheKey)) {
      const cached = detectionCache.get(cacheKey);
      setDetectionResults(cached);
      // ensure UI indicator knows this key is detected
      setDetectedKeys((prev) => new Set(prev).add(cacheKey));
      // remove from selectedIds so it becomes unchecked and unselectable
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (imageId) next.delete(imageId);
        next.delete(imageUrl);
        return next;
      });
      if (openViewer) {
        setViewerImages([{ id: cacheKey, name: cacheKey, path: imageUrl }]);
        setViewerIndex(0);
        setViewerOpen(true);
      }
      return;
    }

    try {
      setDetecting(true);
      // call detection API
      const res = await fetch("http://localhost:8000/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: imageUrl }),
      });
      if (!res.ok) throw new Error(`Detect API error ${res.status}`);
      const data = await res.json();

      // transform API detections (bbox x1,y1,x2,y2) -> predictions with center x/y and width/height
      const predictions = (data?.detections || []).map((d: any, idx: number) => {
        const x1 = Number(d?.bbox?.x1 ?? 0);
        const y1 = Number(d?.bbox?.y1 ?? 0);
        const x2 = Number(d?.bbox?.x2 ?? 0);
        const y2 = Number(d?.bbox?.y2 ?? 0);
        const width = Math.max(0, x2 - x1);
        const height = Math.max(0, y2 - y1);
        const cx = x1 + width / 2;
        const cy = y1 + height / 2;
        return {
          id: d.id ?? `pred-${idx}`,
          class: d.label ?? d?.label_name ?? "Unknown",
          confidence: d.confidence ?? d.score ?? 0,
          x: cx,
          y: cy,
          width,
          height,
        };
      });

      const transformed = {
        success: data?.success ?? true,
        total_detections: data?.total_detections ?? predictions.length,
        object_counts: data?.object_counts ?? data?.object_counts ?? {},
        predictions,
      };

      setDetectionResults(transformed);

      // cache in-memory keyed by id or url and mark detected
      if (cacheKey) {
        detectionCache.set(cacheKey, transformed);
        setDetectedKeys((prev) => new Set(prev).add(cacheKey));
        // after successful detection, remove from selectedIds so it can't be re-selected
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (imageId) next.delete(imageId);
          next.delete(imageUrl);
          return next;
        });
      }

      // open full screen viewer with this image (unless caller asked not to)
      if (openViewer) {
        setViewerImages([{ id: imageId ?? imageUrl, name: imageId ?? "image", path: imageUrl }]);
        setViewerIndex(0);
        setViewerOpen(true);
      }
    } catch (err: any) {
      console.error("Detection failed", err);
      alert("Detection failed. See console for details.");
    } finally {
      setDetecting(false);
    }
  };

  return (
    <div className="flex h-[92vh]  overflow-hidden bg-white">
      <div className="flex-1 p-8 overflow-y-auto">
       <div className="flex items-center justify-between mb-10 border-b-2 border-gray-200 pb-4">
  {/* Left side */}
  <div>
    <h1 className="text-2xl font-semibold text-gray-900">Blue Print Foor Plans</h1>
    <p className="text-sm text-gray-500">
      Managing blueprint sheets & takeoff images
    </p>
  </div>

  {/* Right side */}
  <div className="flex items-center space-x-3">
    <span className="text-sm text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded">
      Selected: {selectedIds.size}
    </span>

    <button
      onClick={() => {
        const allSelected = images.length > 0 && images.every((it) => selectedIds.has(it.id));
        if (allSelected) clearSelection();
        else {
          // only select images that are not yet detected
          const selectableIds = images.filter((it) => !detectedKeys.has(it.id) && !detectedKeys.has(it.url ?? "")).map((it) => it.id);
          setSelectedIds(new Set(selectableIds));
        }
      }}
      disabled={images.length === 0}
      className={`text-sm px-3 py-1.5 rounded-md border ${
        images.length === 0
          ? "text-gray-300 border-gray-200"
          : "text-blue-600 border-blue-200 hover:bg-blue-50"
      }`}
    >
      {images.length > 0 && images.every((it) => selectedIds.has(it.id))
        ? "Unselect All"
        : "Select All"}
    </button>

    {selectedIds.size > 0 && (
      <button
        className="text-sm px-3 py-1.5 rounded-md border border-red-200 text-red-600 hover:bg-red-50"
        onClick={clearSelection}
      >
        Clear
      </button>
    )}

    <button
      disabled={selectedIds.size === 0 || processing}
      onClick={handleProcessSelected}
      className={`text-sm px-3 py-1.5 rounded-md font-medium ${
        selectedIds.size === 0 || processing
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : "bg-green-600 text-white hover:bg-green-700"
      }`}
    >
      {processing ? `Processing ${processedCount}/${selectedIds.size}` : "Process"}
    </button>
  </div>
</div>

     

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img) => (
            <ImageCard
              key={img.id}
              image={img}
              selected={selectedIds.has(img.id)}
              deleting={deleting}
              draggable
              onDragStart={(e) => {
                try {
                  e.dataTransfer?.setData("text/plain", img.id);
                } catch (err) {
                  /* ignore */
                }
              }}
              onClick={(it) => setSelected(it)}
              onToggleSelect={(id) => toggleSelect(id)}
              onDelete={(id) => handleDelete(id)}
              hasDetection={!!(detectedKeys.has(img.id) || detectedKeys.has(img.url ?? ''))}
              selectable={!detectedKeys.has(img.id) && !detectedKeys.has(img.url ?? '')}
            />
          ))}
        </div>
      </div>
    <OverviewPanel
  selected={selected}
  isDragOver={isDragOver}
  setIsDragOver={setIsDragOver}
  toggleSelect={toggleSelect}
  selectedIds={selectedIds}
  handleDelete={handleDelete}
  onSelectImage={(id: string) => {
    const found = images.find((it) => it.id === id);
    if (found) setSelected(found);
  }}
  onDetect={(imageUrl: string) => handleDetect(imageUrl, selected?.id)}
  detecting={detecting}
  hasCachedDetection={!!(selected && (detectedKeys.has(selected.id ?? '') || detectedKeys.has(selected.url ?? '')))}
/>
      {viewerOpen && (
        <FullScreenImageViewer
          images={viewerImages}
          initialIndex={viewerIndex}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          onImageChange={() => {}}
          detectionResults={detectionResults}
        />
      )}
   {loading && <Loader/>}
        {error && <div className="text-sm text-red-500">{error}</div>}
        {!loading && !error && images.length === 0 && (
          <div className="text-sm text-gray-500">No images found.</div>
        )}
    </div>
  );
};

export default BluePrintDetection;
