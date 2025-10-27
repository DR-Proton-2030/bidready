"use client";

import React, { useCallback, useRef, useState } from "react";
import { X, Upload, ArrowUpRight, Trash2, Image } from "lucide-react";

type ImageCardProps = {
  maxFiles?: number;
  onChange?: (files: File[]) => void;
  onUpload?: (files: File[]) => Promise<void> | void;
  blueprint_images?: any[];
};

type FilePreview = {
  file: File;
  src: string;
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
      onChange?.(items.map((p) => p.file));
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
      }));

      const merged = [...previews, ...newPreviews];
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
    if (target) URL.revokeObjectURL(target.src);
    const next = previews.filter((_, i) => i !== index);
    setPreviews(next);
    notifyChange(next);
  };

  const handleUpload = async () => {
    if (!onUpload) return;
    try {
      await onUpload(previews.map((p) => p.file));
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const openFileDialog = () => inputRef.current?.click();

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
                    <img
                      src={p.src}
                      alt={p.file.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full hover:bg-black/70"
                      onClick={() => removeAt(idx)}
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                    <p className="text-xs text-center mt-1 text-gray-500 truncate">
                      {p.file.name}
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
