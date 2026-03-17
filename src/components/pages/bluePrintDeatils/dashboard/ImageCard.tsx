"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Upload, ArrowUpRight, Image, Check, Map } from "lucide-react";
import ImagePreview, { FilePreview as PreviewType } from "./ImagePreview";
import useImageDetect from "@/hooks/useImageDetect";
import useBulkDetectionsUpload from "@/hooks/useBulkDetectionsUpload";
import FullScreenImageViewer from "@/components/shared/FullScreenImageViewer";
import axios from "axios";

type ImageCardProps = {
  maxFiles?: number;
  onChange?: (files: File[]) => void;
  onUpload?: (files: File[]) => Promise<void> | void;
  blueprint_images?: any[];
};

type FilePreview = {
  // local file for uploads; undefined for remote/preloaded images
  file?: File | null;
  // image src (either object URL or remote URL)
  src: string;
  // original filename (optional)
  name?: string;
  // whether this preview comes from remote blueprint_images prop
  remote?: boolean;
  // whether server returned an svg overlay for this image
  overlay?: boolean;
  // optional overlay payload (keeps original svg_overlay_url object)
  overlayData?: any;
  // optional id from server for remote images
  id?: string;
};

const ImageCard: React.FC<ImageCardProps> = ({
  maxFiles = 5,
  onChange,
  onUpload,
  blueprint_images,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previews, setPreviews] = useState<PreviewType[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [drawerActive, setDrawerActive] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notifyChange = useCallback(
    (items: FilePreview[]) => {
      // only notify with actual File objects (local uploads)
      const files = items.filter((p) => p.file).map((p) => p.file!);
      onChange?.(files);
    },
    [onChange],
  );

  const openPanel = useCallback(() => {
    setSidebarOpen(true);
    if (typeof window !== "undefined" && "requestAnimationFrame" in window) {
      window.requestAnimationFrame(() => setDrawerActive(true));
      return;
    }
    setDrawerActive(true);
  }, []);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files);
      const images = arr.filter((f) => f.type.startsWith("image/"));
      if (!images.length) return;

      const allowed = maxFiles - previews.length;
      const toAdd = images.slice(0, Math.max(0, allowed));

      const newPreviews = toAdd.map((file) => ({
        file,
        src: URL.createObjectURL(file),
        name: file.name,
        remote: false,
      }));
      // put newly added uploads on top
      const merged = [...newPreviews, ...previews];
      setPreviews(merged);
      notifyChange(merged);
      openPanel();
    },
    [maxFiles, previews, notifyChange, openPanel],
  );

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const removeAt = (index: number) => {
    const target = previews[index];
    if (target && !target.remote && target.src.startsWith("blob:")) {
      // only revoke object URLs created for local files
      URL.revokeObjectURL(target.src);
    }
    const next = previews.filter((_, i) => i !== index);
    setPreviews(next);
    notifyChange(next);
  };

  // initialize with blueprint_images if provided
  useEffect(() => {
    // Transform new remote images
    const preloaded: PreviewType[] = (blueprint_images || []).map(
      (img: any) => ({
        file: null,
        src: img.file_url,
        name: img.file_url?.split("/").pop?.() ?? img.file_url,
        remote: true,
        id: img._id,
        overlay: Boolean(img.svg_overlay_url),
        overlayData: img.svg_overlay_url,
      }),
    );

    setPreviews((prev) => {
      // Keep existing LOCAL uploads
      const localFiles = prev.filter((p) => !p.remote);

      // Combine local uploads + new remote images
      // (Local uploads stay on top/first as per existing behavior in addFiles,
      // but typically we might want remote loaded ones to replace old remote ones)
      return [...localFiles, ...preloaded];
    });
  }, [blueprint_images]);

  const handleUpload = async () => {
    if (!onUpload) return;
    try {
      const filesToUpload = previews
        .map((p) => p.file)
        .filter(Boolean) as File[];
      if (!filesToUpload.length) return;
      await onUpload(filesToUpload);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const openFileDialog = () => inputRef.current?.click();

  const closePanel = () => {
    setDrawerActive(false);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    // match transition duration (500ms) + small buffer
    hideTimerRef.current = setTimeout(() => setSidebarOpen(false), 560);
  };

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const { detectImage, loading: detectingError } = useImageDetect();
  const [detectingIds, setDetectingIds] = useState<Set<string>>(new Set());
  const { uploadDetections, isUploading: isSaving } = useBulkDetectionsUpload();

  // Inline viewer state (no new page)
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState<
    Array<{ id: string; name: string; path: string }>
  >([]);
  const [viewerDetectionResults, setViewerDetectionResults] =
    useState<any>(null);
  const [viewerImageId, setViewerImageId] = useState<string | null>(null);
  const [viewerImageUrl, setViewerImageUrl] = useState<string | null>(null);
  const detectionCacheRef = useRef<Record<string, any>>({});

  const viewDetection = async (p: FilePreview) => {
    const imageId = p.id || p.src;

    // If we already have a plan/overlay, view it inline
    if (p.overlay) {
      setViewerImages([{ id: imageId, name: p.name || "image", path: p.src }]);
      setViewerDetectionResults(p.overlayData);
      setViewerImageId(imageId);
      setViewerImageUrl(p.src);
      setViewerOpen(true);
    } else {
      // Trigger detection, then show inline
      try {
        if (detectingIds.has(imageId)) return;
        setDetectingIds((prev) => new Set(prev).add(imageId));
        console.log("Starting detection for", p.src);
        const result = await detectImage(p.src);
        console.log("Detection Result:", result);

        // Also call the Roboflow electrical model
        let electricalPreds: any[] = [];
        try {
          const rfResp = await axios({
            method: "POST",
            url: "https://serverless.roboflow.com/electrical-42wl4/2",
            params: {
              api_key: "ShBtUdx8mVaP10M9vPB9",
              image: p.src,
              confidence: 5,
              overlap: 30,
            },
          });
          const raw = rfResp.data?.predictions ?? [];
          electricalPreds = raw.map((pred: any) => ({
            id: pred.detection_id ?? undefined,
            class: pred.class ?? pred.label ?? "Unknown",
            confidence:
              typeof pred.confidence === "number" ? pred.confidence : undefined,
            x: typeof pred.x === "number" ? pred.x : 0,
            y: typeof pred.y === "number" ? pred.y : 0,
            width: typeof pred.width === "number" ? pred.width : 0,
            height: typeof pred.height === "number" ? pred.height : 0,
            source: "Electrical",
          }));
        } catch (rfErr: any) {
          console.error("Electrical model error:", rfErr?.message ?? rfErr);
        }

        const combined = { ...result, electricalPredictions: electricalPreds };
        detectionCacheRef.current[imageId] = combined;

        // Open inline viewer
        setViewerImages([
          { id: imageId, name: p.name || "image", path: p.src },
        ]);
        setViewerDetectionResults(combined);
        setViewerImageId(imageId);
        setViewerImageUrl(p.src);
        setViewerOpen(true);
      } catch (err) {
        console.error("Detection failed:", err);
      } finally {
        setDetectingIds((prev) => {
          const next = new Set(prev);
          next.delete(imageId);
          return next;
        });
      }
    }
  };

  const handleViewerClose = async () => {
    // Auto-save detections to DB when closing the viewer
    if (viewerImageId && viewerImageUrl) {
      const cached = detectionCacheRef.current[viewerImageId];
      if (cached) {
        try {
          const payload = [
            {
              _id: viewerImageId,
              imgurl: viewerImageUrl,
              detection: cached,
            },
          ];
          console.log("Saving detection to DB:", payload);
          await uploadDetections(payload);
          console.log("Detection saved successfully");

          // Update the preview to show as "Ready" (overlay)
          setPreviews((prev) =>
            prev.map((pr) => {
              if ((pr.id || pr.src) === viewerImageId) {
                return { ...pr, overlay: true, overlayData: cached };
              }
              return pr;
            }),
          );
        } catch (err) {
          console.error("Failed to save detection:", err);
        }
      }
    }
    setViewerOpen(false);
    setViewerDetectionResults(null);
    setViewerImageId(null);
    setViewerImageUrl(null);
  };

  return (
    <div className="w-full lg:w-1/3 flex-shrink-0">
      <div
        role="button"
        tabIndex={0}
        onClick={openPanel}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") openPanel();
        }}
        className="group relative h-72 rounded-2xl border border-slate-200/60 bg-white overflow-hidden shadow-sm cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-slate-300/70"
      >
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/60 via-white to-indigo-50/50" />
        <div className="pointer-events-none absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-gradient-to-br from-orange-400/10 to-orange-500/5 blur-xl" />
        <div className="pointer-events-none absolute -left-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br from-indigo-400/10 to-indigo-500/5 blur-xl" />

        <div className="relative z-10 flex h-full flex-col justify-between p-6">
          {/* Top section */}
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-md transition-transform duration-300 group-hover:scale-110">
              <Map className="w-[18px] h-[18px] text-white" />
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white transition-transform duration-300 group-hover:scale-110 group-hover:bg-orange-500">
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>

          {/* Bottom section */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Floor Plans
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              View and manage all blueprint floor images
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {previews.length} image{previews.length !== 1 ? "s" : ""}
              </span>
              <span className="text-xs text-slate-400">Click to open</span>
            </div>
          </div>
        </div>
      </div>

      {sidebarOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed h-screen inset-0 z-[70] flex items-stretch justify-end px-0 sm:px-0">
            <div
              className={`absolute inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity
               duration-500 ${drawerActive ? "opacity-100" : "opacity-0"}`}
              onClick={closePanel}
            />

            <div className="relative z-10 pointer-events-none w-full">
              <div
                className={`pointer-events-auto fixed right-0 top-0 h-full w-full
                sm:w-[520px] md:w-[640px] sm:max-w-[80vw] border-l border-slate-200/50
                bg-white
                shadow-[-20px_0_60px_rgba(15,23,42,0.15)] transform transition-transform duration-500 ease-out
                 ${drawerActive ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}
              >
                <div className="z-10 flex h-full flex-col">
                  {/* Drawer header */}
                  <div className="shrink-0 border-b border-slate-100 px-8 pt-8 pb-6">
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-400">
                            <Image className="h-3.5 w-3.5 text-white" />
                          </div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                            Blueprint Library
                          </p>
                        </div>
                        <h2 className="text-2xl font-semibold text-slate-900">
                          Floor Plan Media
                        </h2>
                        <p className="mt-2 text-sm text-slate-500 max-w-md">
                          Upload, review, and launch detections for every
                          blueprint image.
                        </p>
                      </div>
                      <button
                        onClick={closePanel}
                        className="rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                        aria-label="Close viewer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Image grid area */}
                  <div className="flex-1 overflow-hidden px-8 pt-6">
                    {previews.length ? (
                      <div className="h-full overflow-y-auto pr-1 -mr-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {previews.map((p, idx) => (
                            <ImagePreview
                              key={p.src ?? p.id ?? idx}
                              p={p}
                              idx={idx}
                              onRemove={(i) => removeAt(i)}
                              onViewDetection={(preview) =>
                                viewDetection(preview)
                              }
                              loading={detectingIds.has(p.id || p.src)}
                              disabled={detectingIds.size > 0}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mb-4">
                          <Image className="w-7 h-7 text-slate-400" />
                        </div>
                        <p className="text-base font-medium text-slate-600">
                          No blueprint images yet
                        </p>
                        <p className="text-sm text-slate-400 mt-1 max-w-xs">
                          Upload files to visualize them here in a responsive
                          grid.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Drawer footer */}
                  <div className="shrink-0 flex items-center justify-between border-t border-slate-100 px-8 py-4">
                    <p className="text-xs font-medium text-slate-400 tabular-nums">
                      {previews.length} / {maxFiles} synced
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={closePanel}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                      >
                        Close
                      </button>
                      <button
                        onClick={handleUpload}
                        disabled={!previews.length || !onUpload}
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-40"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Upload
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Inline FullScreenImageViewer via portal – renders at body level above sidebar/navbar */}
      {viewerOpen &&
        createPortal(
          <FullScreenImageViewer
            images={viewerImages}
            initialIndex={0}
            isOpen={viewerOpen}
            onClose={handleViewerClose}
            onImageChange={() => {}}
            detectionResults={viewerDetectionResults}
            onDetectionsChange={(
              imageId: string,
              combinedDetections: Array<any>,
            ) => {
              try {
                const existing = detectionCacheRef.current[imageId] ?? {};
                const normalized = combinedDetections.map((d: any) => ({
                  id: d.id ?? undefined,
                  class: d.className ?? d.class ?? "Unknown",
                  confidence:
                    typeof d.confidence === "number" ? d.confidence : undefined,
                  x: typeof d.x === "number" ? d.x : 0,
                  y: typeof d.y === "number" ? d.y : 0,
                  width: typeof d.width === "number" ? d.width : 0,
                  height: typeof d.height === "number" ? d.height : 0,
                  source: d.source ?? "User",
                  points: d.points ?? undefined,
                }));
                detectionCacheRef.current[imageId] = {
                  ...existing,
                  predictions: normalized,
                  combined_export: combinedDetections,
                };
              } catch (e) {
                console.error("Failed to store combined detections:", e);
              }
            }}
          />,
          document.body,
        )}
    </div>
  );
};

export default ImageCard;
