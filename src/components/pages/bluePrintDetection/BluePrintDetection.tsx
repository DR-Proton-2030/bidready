"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import useBlueprintImages, { BlueprintImage } from "../../../hooks/useBlueprintImages";
import useDeleteBlueprintImage from "../../../hooks/useDeleteBlueprintImage";
import useBulkDetectionsUpload from "@/hooks/useBulkDetectionsUpload";
import { Trash, Trash2, Trash2Icon } from "lucide-react";
import ImageCard from "../../shared/imagecard/ImageCard";
import OverviewPanel from "@/components/shared/overviewPanel/OverviewPanel";
import FullScreenImageViewer from "@/components/shared/FullScreenImageViewer";
import Loader from "@/components/shared/loader/Loader";
import useImageDetect from "@/hooks/useImageDetect";
import axios from "axios";
import { s } from "node_modules/framer-motion/dist/types.d-Cjd591yU";

const BluePrintDetection = ({ id: propId }: any) => {
  const resolveIdFromWindow = (propId?: string | null): string | null => {
    if (propId) return propId;
    if (typeof window === "undefined") return null;
    const path = window.location.pathname || "";
    const m = path.match(/\/blueprint_detection\/([^\/\?]+)/);
    return m ? m[1] : null;
  };
  const { images, loading, error, refetch } = useBlueprintImages(propId ?? null);
  const router = useRouter();
  const { deleteImage, loading: deleting, error: deleteError } = useDeleteBlueprintImage();
  const [selected, setSelected] = useState<BlueprintImage | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState<Array<{ id: string; name: string; path: string }>>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [detectionResults, setDetectionResults] = useState<any | null>(null);
  const [detecting, setDetecting] = useState(false);
  const { detectImage, loading: detectLoading } = useImageDetect();
  const [detectionCache] = useState<Map<string, any>>(() => new Map());
  const [detectedKeys, setDetectedKeys] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const { uploadDetections, isUploading: isUploadingDetections } = useBulkDetectionsUpload();

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

  const handleSaveDetected = async () => {
    setSaving(true);
    const result = Array.from(detectedKeys)
      .map((key) => {
        const found = images.find((it) => it.id === key || it.url === key);
        const imgurl = found?.url ?? (typeof key === "string" && (key.startsWith("http://") || key.startsWith("https://")) ? key : undefined);
        const detection = detectionCache.get(key) ?? null;
        // include _id (image id) when available, otherwise null
        return imgurl ? { _id: found?.id ?? null, imgurl, detection } : null;
      })
      .filter((it): it is { _id: string | null; imgurl: string; detection: any } => it !== null);

    console.log("Detected items (batch):", result);

    if (result.length === 0) {
      alert("No detected items to save.");
      router.push(`/blueprints/${resolveIdFromWindow(propId)}`);
      setSaving(false);
      return;
    }

    try {
      // Use hook to upload bulk detections
      const body = await uploadDetections(result);
      console.log("Bulk save response:", body);
      router.push(`/blueprints/${propId}`);
      // alert(`Bulk save successful: ${result.length} item(s) sent.`);
    } catch (err: any) {
      console.error("Bulk save error:", err);
      alert(`Bulk save failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
    }
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
      const transformed = await detectImage(imageUrl);
      setDetectionResults(transformed);

      // Also call the Roboflow electrical model and store the normalized response for later integration
      let electricalPreds: any[] | undefined = undefined;
      try {
        const rfResp = await axios({
          method: "POST",
          url: "https://serverless.roboflow.com/electrical-42wl4/2",
          params: {
            api_key: "ShBtUdx8mVaP10M9vPB9",
            image: imageUrl,
            confidence: 5,
            overlap: 30
          },
        });
        // Normalize electrical predictions to a consistent shape
        const raw = rfResp.data?.predictions ?? [];
        electricalPreds = raw.map((p: any) => ({
          id: p.detection_id ?? undefined,
          class: p.class ?? p.label ?? "Unknown",
          confidence: typeof p.confidence === "number" ? p.confidence : undefined,
          x: typeof p.x === "number" ? p.x : 0,
          y: typeof p.y === "number" ? p.y : 0,
          width: typeof p.width === "number" ? p.width : 0,
          height: typeof p.height === "number" ? p.height : 0,
          source: "Electrical",
          // Roboflow won't provide polygon points — leave undefined
        }));

        console.log("Electrical model response (normalized) for", cacheKey, electricalPreds);
      } catch (rfErr: any) {
        console.error("Electrical model error:", rfErr?.message ?? rfErr);
      }

      // cache in-memory keyed by id or url and mark detected
      if (cacheKey) {
        // store transformed detectionResults and electrical predictions together
        const toCache = {
          ...transformed,
          electricalPredictions: electricalPreds ?? [],
        };
        detectionCache.set(cacheKey, toCache);
        // update current detectionResults so viewer can access electrical preds immediately
        setDetectionResults(toCache);
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
      alert(`Detection failed: ${err instanceof Error ? err.message : String(err)}`);
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
            <h1 className="text-2xl font-semibold text-gray-900">AI Blueprint Detection</h1>
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
              className={`text-sm px-3 py-1.5 rounded-md border ${images.length === 0
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
              className={`text-sm px-3 py-1.5 rounded-md font-medium ${selectedIds.size === 0 || processing
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
                }`}
            >
              {processing ? `Processing ${processedCount}/${selectedIds.size}` : "Process"}
            </button>
            <button
              onClick={() => router.back()}
              className={`text-sm px-3 py-1.5 rounded-md font-medium ml-2 border bg-gray-50 text-gray-700 hover:bg-gray-100`}
            >
              Back
            </button>
            <button
              disabled={detectedKeys.size === 0}
              onClick={handleSaveDetected}
              className={`text-sm px-3 py-1.5 rounded-md font-medium ml-2 border ${detectedKeys.size === 0 ? "text-gray-400 border-gray-200 bg-gray-100" : "text-blue-600 border-blue-200 hover:bg-blue-50"
                }`}
            >
              Save
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
          onImageChange={() => { }}
          detectionResults={detectionResults}
          onDetectionsChange={(imageId: string, combinedDetections: Array<any>) => {
            try {
              const existing = detectionCache.get(imageId) ?? {};
              // Normalize combined detections into a predictions array compatible with API shape
              const normalized = combinedDetections.map((d: any) => ({
                id: d.id ?? undefined,
                class: d.className ?? d.class ?? "Unknown",
                confidence: typeof d.confidence === "number" ? d.confidence : undefined,
                x: typeof d.x === "number" ? d.x : 0,
                y: typeof d.y === "number" ? d.y : 0,
                width: typeof d.width === "number" ? d.width : 0,
                height: typeof d.height === "number" ? d.height : 0,
                source: d.source ?? "User",
                points: d.points ?? undefined,
              }));

              // store merged data so save can include both api predictions and user annotations
              detectionCache.set(imageId, { ...existing, predictions: normalized, combined_export: combinedDetections });

              // mark as detected so Save will include this image
              setDetectedKeys((prev) => new Set(prev).add(imageId));
            } catch (e) {
              // eslint-disable-next-line no-console
              console.error('Failed to store combined detections:', e);
            }
          }}
        />
      )}
      {loading && <Loader />}
      {saving && <Loader />}
      {error && <div className="text-sm text-red-500">{error}</div>}
      {!loading && !error && images.length === 0 && (
        <div className="text-sm text-gray-500">No images found.</div>
      )}
    </div>
  );
};

export default BluePrintDetection;
