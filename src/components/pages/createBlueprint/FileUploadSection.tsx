"use client";

import React from "react";
import { Upload, Loader2 } from "lucide-react";

interface FileUploadSectionProps {
  isUploading: boolean;
  onFileUpload: (files: FileList) => void;
}

export default function FileUploadSection({
  isUploading,
  onFileUpload,
}: FileUploadSectionProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files) {
      onFileUpload(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      onFileUpload(files);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Upload Blueprint Files
      </h2>
      <p className="text-gray-600 mb-6">
        Upload blueprint images or PDF files. PDFs will open in our annotation
        editor, images will be processed for AI detection.
      </p>

      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200 hover:border-blue-500 hover:bg-blue-50
          ${
            isUploading
              ? "pointer-events-none opacity-50"
              : "border-gray-300"
          }
        `}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-4">
            <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
            <div>
              <p className="text-lg font-medium text-gray-700">
                Processing files...
              </p>
              <p className="text-sm text-gray-500">
                Please wait while we prepare your files.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-700">
                Drop your blueprint files here or click to browse
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supports images (PNG, JPG, GIF, WebP, SVG) and PDF files up to
                10MB each
              </p>
              <p className="text-xs text-gray-400 mt-1">
                • PDFs open in annotation editor
                <br />• Images processed with AI detection
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
