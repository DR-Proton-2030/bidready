"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBlueprints } from "@/hooks/useBlueprints/useBlueprints";
import Header from "@/components/pages/createBlueprint/Header";
import TitleField from "@/components/pages/createBlueprint/TitleField";
import DescriptionField from "@/components/pages/createBlueprint/DescriptionField";
import ScopeField from "@/components/pages/createBlueprint/ScopeField";
import StatusBadges from "@/components/pages/createBlueprint/StatusBadges";
import ErrorMessage from "@/components/pages/createBlueprint/ErrorMessage";
import FullScreenImageViewer from "@/components/shared/FullScreenImageViewer";
import FileUploadSection from "@/components/pages/createBlueprint/FileUploadSection";
import ProcessedImagesSection from "@/components/pages/createBlueprint/ProcessedImagesSection";
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
  svgOverlay?: string | null; // SVG overlay URL or data
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
  const [svgOverlays, setSvgOverlays] = useState<Map<string, string | null>>(new Map());
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [showPdfEditor, setShowPdfEditor] = useState(false);
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
      const apiResponse = await fetch("http://localhost:5050/detect", {
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

  // Handle SVG overlay updates from FullScreenImageViewer
  const handleSvgOverlayUpdate = useCallback((imageId: string, svgData: string | null) => {
    setSvgOverlays(prev => {
      const current = prev.get(imageId);
      if (current === svgData) return prev; // No change, avoid update
      return new Map(prev.set(imageId, svgData));
    });
    
    // Also update the processedImages array to include SVG overlay info
    setProcessedImages(prev => 
      prev.map(img => 
        img.id === imageId 
          ? { ...img, svgOverlay: svgData }
          : img
      )
    );
  }, []);

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError("");

    try {
      const filesArray = Array.from(files);
      
      // Check if any file is a PDF
      const hasPDF = filesArray.some(file => file.type === "application/pdf");
      
      if (hasPDF) {
        // If PDF, handle PDF upload separately and redirect to PDF annotation page
        if (filesArray.length > 1) {
          setError("Please upload only one PDF file at a time");
          setIsUploading(false);
          return;
        }

        const pdfFile = filesArray[0];
        const formData = new FormData();
        formData.append("pdf_file", pdfFile);

        const response = await fetch("/api/blueprints/upload-pdf", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload PDF");
        }

        const result = await response.json();

        // Pass form data as URL parameters when redirecting to PDF annotation page
        const formParams = new URLSearchParams({
          name: form.name || 'Untitled Blueprint',
          description: form.description || 'Blueprint from PDF',
          version: form.version || 'v1',
          status: form.status || 'active',
          type: form.type || 'floor_plan',
          project_object_id: form.project_object_id || ''
        });

        // Redirect to PDF annotation page
        router.push(`/pdf-annotation/${result.jobId}?${formParams.toString()}`);
        return;
      }

      // For images, continue with existing flow
      const formData = new FormData();
      filesArray.forEach((file) => {
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

      // Pass form data as URL parameters when redirecting to processing page
      const formParams = new URLSearchParams({
        name: form.name || 'Untitled Blueprint',
        description: form.description || 'Blueprint from uploaded files',
        version: form.version || 'v1',
        status: form.status || 'active',
        type: form.type || 'floor_plan',
        project_object_id: form.project_object_id || ''
      });

      // Redirect to processing page with form data
      router.push(`/blueprint-processing/${result.jobId}?${formParams.toString()}`);
    } catch (error) {
      console.error("Error uploading files:", error);
      setError(
        error instanceof Error ? error.message : "Failed to upload files"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearImages = () => {
    setProcessedImages([]);
    // Clear URL params
    const url = new URL(window.location.href);
    url.searchParams.delete("processedImages");
    url.searchParams.delete("jobId");
    window.history.replaceState({}, "", url.toString());
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

      // Create image_pairs array with image files and SVG overlays
      const imagePairs = await Promise.all(
        processedImages.map(async (image, index) => {
          // Fetch the image file from the server
          const imageResponse = await fetch(image.path);
          const imageBlob = await imageResponse.blob();
          const imageFile = new File([imageBlob], image.name, { type: imageBlob.type });
          
          // Get SVG overlay for this image (null if no detection/annotation was done)
          const svgOverlay = svgOverlays.get(image.id) || image.svgOverlay || null;
          
          return {
            image: imageFile,
            svg_overlay: svgOverlay,
            imageId: image.id,
            imageName: image.name,
            pageNumber: image.pageNumber
          };
        })
      );

      // Add image files to FormData
      imagePairs.forEach((pair, index) => {
        fd.append(`image_${index}`, pair.image);
        if (pair.svg_overlay) {
          fd.append(`svg_overlay_${index}`, pair.svg_overlay);
        }
      });

      // Add image_pairs metadata
      const imagePairsMetadata = imagePairs.map((pair, index) => ({
        imageIndex: index,
        imageId: pair.imageId,
        imageName: pair.imageName,
        pageNumber: pair.pageNumber,
        hasSvgOverlay: !!pair.svg_overlay
      }));
      
      fd.append("image_pairs", JSON.stringify(imagePairsMetadata));
      fd.append("blueprint_files_count", String(processedImages.length));

      console.log("======>payload structure:", {
        name: form.name,
        description: form.description,
        version: form.version,
        status: form.status,
        type: form.type,
        project_object_id: form.project_object_id,
        image_pairs: imagePairsMetadata
      });

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
            <FileUploadSection
              isUploading={isUploading}
              onFileUpload={handleFileUpload}
            />
          ) : (
            /* Processed Images Preview */
            <ProcessedImagesSection
              images={processedImages}
              onImageClick={handleImageClick}
              onClearImages={handleClearImages}
            />
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
        onSvgOverlayUpdate={handleSvgOverlayUpdate}
      />
    </div>
  );
}
