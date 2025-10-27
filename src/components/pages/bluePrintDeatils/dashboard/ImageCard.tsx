"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { X, Upload, ArrowUpRight, Trash2, Image, Check } from "lucide-react";

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
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const notifyChange = useCallback(
    (items: FilePreview[]) => {
      // only notify with actual File objects (local uploads)
      const files = items.filter((p) => p.file).map((p) => p.file!)
      onChange?.(files)
    },
    [onChange]
  );

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
      setSidebarOpen(true);
    },
    [maxFiles, previews, notifyChange]
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
    if (!blueprint_images || !blueprint_images.length) return;
    const preloaded: FilePreview[] = blueprint_images.map((img: any) => ({
      file: null,
      src: img.file_url,
      name: img.file_url?.split("/").pop?.() ?? img.file_url,
      remote: true,
      id: img._id,
      overlay: Boolean(img.svg_overlay_url),
      overlayData: img.svg_overlay_url,
    }));
    // append preloaded images after any existing previews (but keep existing local ones on top)
    // avoid duplicates (React Strict Mode may run this effect twice in development)
    setPreviews((cur) => {
      const existing = new Set(cur.map((p) => p.src));
      const toAdd = preloaded.filter((p) => !existing.has(p.src));
      if (!toAdd.length) return cur;
      return [...cur, ...toAdd];
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

  const viewDetection = (p: FilePreview) => {
    if (typeof window === "undefined") return;
    try {
      // store payload in localStorage under a short key to avoid long query strings
      const payload = { file_url: p.src, svg_overlay_url: p.overlayData };
      const key = `blueprint_detection_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      try {
        localStorage.setItem(key, JSON.stringify(payload));
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
    <div className="relative bg-gray-50 p-6 rounded-2xl shadow-sm space-y-6">
      {/* Floating Top-Right Button */}
      <div className="absolute top-2 right-2 z-10">
        <div   onClick={() => setSidebarOpen(true)} className={`flex items-center justify-center w-10 h-10 bg-gray-50 rounded-full border`}>
                  <ArrowUpRight className={`w-4 h-4`} />
                </div>
      
      </div>

      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-xl h-full flex flex-col justify-center items-center text-center transition-colors ${
          isDragActive ? "bg-slate-100 border-blue-400" : "border-slate-300"
        }`}
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
       <Image size={56} className="text-gray-600"/>
        <p className="text-gray-600 mx-auto text-xs font-medium">
          Drag & drop images here 
        </p>
      </div>

      {/* Sidebar Modal */}
      {sidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-40 h-screen"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar */}
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Uploaded Images</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {previews.length > 0 ? (
                previews.map((p, idx) => (
                  <div
                    key={idx}
                    className="relative w-full h-40 rounded-xl overflow-hidden border"
                  >
                    {/* Overlay badge for detected svg overlays */}
                    {p.overlay ? (
                      <div
                        onClick={() => viewDetection(p)}
                        className="absolute left-3 top-3 z-20 pl-2 pr-4 py-2 rounded-full shadow-xl shadow-gray-400 bg-green-600 text-white text-md font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowUpRight />
                        View Detection
                      </div>
                    ) : (
                      <div className="absolute left-3 top-3 z-20 pl-2 pr-4 py-2 cursor-pointer shadow-xl shadow-gray-400 rounded-full bg-orange-400 text-white text-md font-medium flex items-center gap-1">
                        <ArrowUpRight />
                        Detect Image
                      </div>
                    )}
                    <img
                      src={p.src}
                      alt={p.file?.name ?? p.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full hover:bg-black/70"
                      onClick={() => removeAt(idx)}
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                    <p className="text-xs text-center mt-1 text-gray-500 truncate">
                      {p.file?.name ?? p.name}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center mt-8">
                  No images uploaded yet.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setSidebarOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                Close
              </button>
              <button
                onClick={handleUpload}
                disabled={!previews.length || !onUpload}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40"
              >
                <Upload className="w-4 h-4 inline mr-1" /> Upload
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ImageCard;
