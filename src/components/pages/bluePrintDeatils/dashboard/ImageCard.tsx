"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { X, Upload, ArrowUpRight, Image, Check, Map } from "lucide-react";
import ImagePreview, { FilePreview as PreviewType } from "./ImagePreview";

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
  blueprint_images
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
      const files = items.filter((p) => p.file).map((p) => p.file!)
      onChange?.(files)
    },
    [onChange]
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
    [maxFiles, previews, notifyChange, openPanel]
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
    const preloaded: PreviewType[] = (blueprint_images || []).map((img: any) => ({
      file: null,
      src: img.file_url,
      name: img.file_url?.split("/").pop?.() ?? img.file_url,
      remote: true,
      id: img._id,
      overlay: Boolean(img.svg_overlay_url),
      overlayData: img.svg_overlay_url,
    }));

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
      const filesToUpload = previews.map((p) => p.file).filter(Boolean) as File[];
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

  const viewDetection = (p: FilePreview) => {
    if (typeof window === "undefined") return;
    try {
      // store payload in localStorage under a short key to avoid long query strings
      const payload = { file_url: p.src, svg_overlay_url: p.overlayData };
      const key = `blueprint_detection_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      // Helper to set and delete short-lived cookies
      const setTempCookie = (name: string, value: string, maxAgeSec = 60 * 5) => {
        try {
          const secure = window.location.protocol === 'https:' ? '; Secure' : '';
          document.cookie = `${encodeURIComponent(name)}=${value}; Max-Age=${maxAgeSec}; Path=/; SameSite=Lax${secure}`;
        } catch (e) {
          // ignore cookie failures
        }
      };
      const deleteCookie = (name: string) => {
        try {
          const secure = window.location.protocol === 'https:' ? '; Secure' : '';
          document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; Path=/; SameSite=Lax${secure}`;
        } catch (e) {
          // ignore cookie failures
        }
      };
      try {
        localStorage.setItem(key, JSON.stringify(payload));
        // Also set a short‑lived cookie with the same key so another tab can read it if preferred
        // Only store a compact encoded version to respect cookie size limits
        const compact = encodeURIComponent(JSON.stringify(payload));
        // Note: cookies have ~4KB limit; this value should only hold small URLs/metadata
        setTempCookie(key, compact, 60 * 5);
        // Safety cleanup after 5 minutes in case the target page doesn't remove it
        setTimeout(() => deleteCookie(key), 60 * 5 * 1000);
      } catch (err) {
        // fallback to direct open with data if localStorage fails
        const encoded = encodeURIComponent(JSON.stringify(payload));
        const url = `/blueprint-detection?data=${encoded}`;
        window.open(url, "_blank");
        return;
      }
      const url = `/blueprint-detection?key=${encodeURIComponent(key)}`;
      window.open(url, "_blank");
    } catch (err) {
      console.error("Failed to open detection page", err);
    }
  };

  return (
    <div className="w-1/3">
      <div
        role="button"
        tabIndex={0}
        onClick={openPanel}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") openPanel();
        }}
        className="h-72 rounded-[28px] border border-white/70 bg-white/75 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.12)] backdrop-blur items-start justify-between flex cursor-pointer transition-transform duration-300 hover:-translate-y-1"
      >
        <h2 className="text-xl font-medium text-gray-900 flex items-center gap-2">
          <Map className="w-5 h-5 text-slate-600" />
          View Floor Plans
        </h2>
        <div className="flex items-center justify-center text-white w-10 h-10 bg-black/70 rounded-full border">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed h-screen inset-0 z-[70] flex items-stretch justify-end px-0 sm:px-4">
          <div
            className={`absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity
               duration-500 ${drawerActive ? "opacity-100" : "opacity-0"}`}
            onClick={closePanel}
          />

          <div className="relative z-10 pointer-events-none w-full">
            <div
              className={`pointer-events-auto fixed right-0 top-0 h-full w-full 
                sm:w-[520px] md:w-[640px] max-w-[80vw]  border-l border-white/20 
                bg-gradient-to-br from-white/95 via-white/90 to-slate-50/80 backdrop-blur-3xl 
                shadow-[0_40px_80px_rgba(15,23,42,0.35)] transform transition-transform duration-500
                 ${drawerActive ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}
            >


              <div className=" z-10 flex h-full flex-col p-8">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Blueprint library</p>
                    <h2 className="mt-2 text-3xl font-semibold text-slate-900">Manage floor plan media</h2>
                    <p className="mt-3 text-sm text-slate-500 max-w-xl">
                      Upload, review, and launch detections for every blueprint. Drag files directly or browse from your device.
                    </p>
                  </div>

                  <button
                    onClick={closePanel}
                    className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100"
                    aria-label="Close viewer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* <div
                  className={`mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors ${isDragActive ? "border-slate-400 bg-slate-100" : "border-slate-300 bg-white/60"}`}
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragActive(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragActive(false);
                  }}
                  onClick={openFileDialog}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) addFiles(e.target.files);
                      e.target.value = "";
                    }}
                    className="hidden"
                  />
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
                    <Image className="h-6 w-6" />
                  </div>
                  <p className="mt-4 text-base font-medium text-slate-800">Drop high-res plans</p>
                  <p className="text-sm text-slate-500">Supported: JPG, PNG, SVG, up to {maxFiles} files</p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    <span className="rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-500">drag n drop</span>
                    <span className="rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-500">browse</span>
                  </div>
                </div> */}

                <div className="mt-6 flex-1 overflow-hidden">
                  {previews.length ? (
                    <div className="h-full overflow-y-auto pr-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {previews.map((p, idx) => (
                          <ImagePreview
                            key={p.src ?? p.id ?? idx}
                            p={p}
                            idx={idx}
                            onRemove={(i) => removeAt(i)}
                            onViewDetection={(preview) => viewDetection(preview)}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-slate-400">
                      <p className="text-lg font-medium">No blueprint images yet</p>
                      <p className="text-sm">Add files to visualize them here in a responsive grid.</p>
                    </div>
                  )}
                </div>

                <div className="mt- flex items-center justify-between border-t border-slate-100 pt-4">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                    synced {previews.length} / {maxFiles}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={closePanel}
                      className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={!previews.length || !onUpload}
                      className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-40"
                    >
                      <Upload className="h-4 w-4" />
                      Upload
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ImageCard;
