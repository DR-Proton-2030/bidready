"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBlueprints } from "@/hooks/useBlueprints/useBlueprints";
import Header from "@/components/pages/createBlueprint/Header";
import TitleField from "@/components/pages/createBlueprint/TitleField";
import DescriptionField from "@/components/pages/createBlueprint/DescriptionField";
import ScopeField from "@/components/pages/createBlueprint/ScopeField";
import StatusBadges from "@/components/pages/createBlueprint/StatusBadges";
import ErrorMessage from "@/components/pages/createBlueprint/ErrorMessage";
import FullScreenImageViewer from "@/components/shared/FullScreenImageViewer";
import {
  Upload,
  FileImage,
  ArrowRight,
  Loader2,
  Eye,
  Clock,
} from "lucide-react";

interface ProcessedImage {
  id: string;
  name: string;
  path: string;
  pageNumber?: number;
}

const statusOptions = ["active", "completed", "on-hold", "in-progress"];

export default function CreateBlueprintPage({
  initialProjectId = "",
}: {
  initialProjectId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    name: "",
    description: "",
    version: "v1",
    status: "active",
    type: "",
    project_object_id: initialProjectId || "",
  });
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const [fullScreenIndex, setFullScreenIndex] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResults, setDetectionResults] = useState<any>(null);
  const { handleNewBlueprint } = useBlueprints();

  // Check if we have processed images from URL params (coming from processing page)
  useEffect(() => {
    const imagesParam = searchParams.get("processedImages");
    if (imagesParam) {
      try {
        const images = JSON.parse(decodeURIComponent(imagesParam));
        setProcessedImages(images);
      } catch (error) {
        console.error("Error parsing processed images:", error);
      }
    }
  }, [searchParams]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (status: string) => {
    setForm({ ...form, status });
  };

  // API call function for image detection
  const detectImageWithAPI = async (image: ProcessedImage) => {
    try {
      console.log("Detecting image with API:", image.name);
      setIsDetecting(true);
      setError("");

      // Convert image URL to File object
      const response = await fetch(image.path);
      const blob = await response.blob();
      const file = new File([blob], image.name, { type: blob.type });

      console.log("Created file object:", file.name, file.type, file.size);

      // Create FormData and send to API
      const formData = new FormData();
      formData.append("image", file);

      console.log("Sending request to detection API...");

      // API endpoint for detection
      const apiResponse = await fetch("http://localhost:5050/api/detect", {
        method: "POST",
        body: formData,
      });

      console.log("API Response status:", apiResponse.status);

      if (!apiResponse.ok) {
        throw new Error(
          `API request failed with status: ${apiResponse.status}`
        );
      }

      const result = await apiResponse.json();
      console.log("Detection result:", result);

      // Store detection results
      setDetectionResults(result);

      // Open the modal after getting results
      setIsFullScreenOpen(true);
    } catch (error) {
      console.error("Error detecting image:", error);
      setError(
        error instanceof Error ? error.message : "Failed to detect image"
      );
    } finally {
      setIsDetecting(false);
    }
  };

  const handleImageClick = (index: number) => {
    setFullScreenIndex(index);
    setIsFullScreenOpen(true);
  };

  const handleImageChange = (image: ProcessedImage, index: number) => {
    console.log("Image changed to:", image.name, "at index:", index);
    detectImageWithAPI(image);
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();

      // Add all files to formData
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/blueprints/process-queue", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload files");
      }

      const result = await response.json();

      // Redirect to processing page
      router.push(`/blueprint-processing/${result.jobId}`);
    } catch (error) {
      console.error("Error uploading files:", error);
      setError(
        error instanceof Error ? error.message : "Failed to upload files"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFileUpload(files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.description || !form.project_object_id) {
      setError("Name, description and project are required.");
      return;
    }

    if (processedImages.length === 0) {
      setError("Please upload and process at least one image or PDF file.");
      return;
    }

    setError("");

    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("version", form.version || "v1");
      fd.append("status", form.status);
      fd.append("type", form.type || "");
      fd.append("project_object_id", form.project_object_id);

      // Add processed images metadata
      fd.append("processed_images", JSON.stringify(processedImages));
      fd.append("blueprint_files_count", String(processedImages.length));

      console.log("======>payload", processedImages);
      await handleNewBlueprint(fd);

      // Success - navigate to blueprints list
      router.push("/blueprints");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create blueprint";
      setError(message);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl  px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="bg-white border border-gray-200 rounded-lg  p-6">
            <Header
              button={false}
              description="Create a new blueprint by filling out the details and uploading your files."
            />
          </div>

          {/* Form Fields */}
          <div className="bg-white border border-gray-200 rounded-lg  p-6 space-y-6">
            <TitleField value={form.name} onChange={handleChange} />

            <DescriptionField
              value={form.description}
              onChange={handleTextareaChange}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Version
                </label>
                <input
                  name="version"
                  type="text"
                  value={form.version}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="v1"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Type
                </label>
                <input
                  name="type"
                  type="text"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="floor_plan"
                />
              </div>
            </div>

            <StatusBadges
              options={statusOptions}
              active={form.status}
              onChange={handleStatusChange}
            />

            <ScopeField
              value={form.project_object_id}
              onChange={handleChange}
            />
          </div>

          {/* File Upload Section */}
          {processedImages.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Upload Blueprint Files
              </h2>
              <p className="text-gray-600 mb-6">
                Upload blueprint images or PDF files. Files will be processed on
                our servers and you'll be able to preview them before creating
                the blueprint.
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
                        Uploading files...
                      </p>
                      <p className="text-sm text-gray-500">
                        Please wait while we upload and queue your files for
                        processing.
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
                        Supports images (PNG, JPG, GIF, WebP, SVG) and PDF files
                        up to 10MB each
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Multiple files supported • Server-side processing
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Processed Images Preview */
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Processed Images ({processedImages.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {processedImages.map((image, index) => (
                  <div
                    key={image.id}
                    className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleImageClick(index)}
                  >
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.path}
                        alt={image.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900 text-sm truncate">
                        {image.name}
                      </h3>
                      {image.pageNumber && (
                        <p className="text-xs text-gray-500 mt-1">
                          Page {image.pageNumber}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    setProcessedImages([]);
                    // Clear URL params
                    const url = new URL(window.location.href);
                    url.searchParams.delete("processedImages");
                    url.searchParams.delete("jobId");
                    window.history.replaceState({}, "", url.toString());
                  }}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear and Upload New Files
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <ErrorMessage message={error} />
            </div>
          )}

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push("/blueprints")}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || processedImages.length === 0}
                className={`
                  px-6 py-2 rounded-md flex items-center space-x-2
                  ${
                    isUploading || processedImages.length === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }
                `}
              >
                <span>Create Blueprint</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Loading overlay for image detection */}
      {isDetecting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-gray-700">Detecting image...</p>
          </div>
        </div>
      )}

      {/* Full Screen Image Viewer */}
      <FullScreenImageViewer
        images={processedImages}
        initialIndex={fullScreenIndex}
        isOpen={isFullScreenOpen}
        onClose={() => {
          setIsFullScreenOpen(false);
          setDetectionResults(null); // Clear detection results when closing
        }}
        onImageChange={handleImageChange}
        detectionResults={detectionResults}
      />
    </div>
  );
}
