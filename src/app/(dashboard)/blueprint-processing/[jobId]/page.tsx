"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  FileImage,
  ArrowLeft,
  Eye,
  Grid3x3,
  Trash2,
  X,
} from "lucide-react";
import FullScreenImageViewer from "@/components/shared/FullScreenImageViewer";
import axios from "axios";

interface ProcessedImage {
  id: string;
  name: string;
  path: string;
  pageNumber?: number;
  svgOverlay?: string | null;
}

interface JobStatus {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  processedImages: ProcessedImage[];
  error?: string;
  progress: {
    total: number;
    processed: number;
  };
}

export default function BlueprintProcessingPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  // Get blueprint form data from URL parameters
  const searchParams = new URLSearchParams(window.location.search);
  const blueprintData = {
    name: searchParams.get('name') || `Blueprint from Job ${jobId}`,
    description: searchParams.get('description') || 'Auto-generated blueprint from processed images',
    version: searchParams.get('version') || 'v1',
    status: searchParams.get('status') || 'active',
    type: searchParams.get('type') || 'floor_plan',
    project_object_id: searchParams.get('project_object_id') || '68b72c0b0002cf35d19b54e4'
  };

  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"fullscreen" | "grid">("fullscreen");
  const [isDetecting, setIsDetecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [detectionResults, setDetectionResults] = useState<any>(null);
  const [removedImages, setRemovedImages] = useState<Set<string>>(new Set());
  const [imageDetectionResults, setImageDetectionResults] = useState<Map<string, any>>(new Map());
  const [svgOverlays, setSvgOverlays] = useState<Map<string, string | null>>(new Map());

  // Filter out removed images
  const filteredImages =
    jobStatus?.processedImages.filter(
      (image) => !removedImages.has(image.id)
    ) || [];

  useEffect(() => {
    if (!jobId) return;

    const pollJobStatus = async () => {
      try {
        const response = await fetch(
          `/api/blueprints/process-queue?jobId=${jobId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch job status");
        }

        const data = await response.json();
        setJobStatus(data);
        setLoading(false);

        // Continue polling if job is still processing
        if (data.status === "pending" || data.status === "processing") {
          setTimeout(pollJobStatus, 2000); // Poll every 2 seconds
        }
      } catch (err) {
        console.error("Error polling job status:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
      }
    };

    pollJobStatus();
  }, [jobId]);

  // API call function for image detection
  const detectImageWithAPI = async (image: ProcessedImage) => {
    try {
      console.log("Detecting image with API:", image.name);
      setIsDetecting(true);
      setError(null);

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

      // Store detection results for this specific image
      setImageDetectionResults(prev => new Map(prev.set(image.id, result)));
      setDetectionResults(result);

      // Open the modal after getting results
      setViewerOpen(true);
    } catch (error) {
      console.error("Error detecting image:", error);
      setError(
        error instanceof Error ? error.message : "Failed to detect image"
      );
    } finally {
      setIsDetecting(false);
    }
  };

  const handleViewDetection = () => {
    if (filteredImages[selectedImageIndex]) {
      detectImageWithAPI(filteredImages[selectedImageIndex]);
    }
  };

  const handleRemoveImage = (imageId: string, event?: React.MouseEvent) => {
    // Prevent event bubbling if called from within a clickable element
    if (event) {
      event.stopPropagation();
    }

    // Add image ID to removed set
    setRemovedImages((prev) => new Set([...prev, imageId]));

    // Adjust selected index if necessary
    const imageIndex = filteredImages.findIndex((img) => img.id === imageId);
    if (imageIndex !== -1) {
      if (selectedImageIndex >= imageIndex && selectedImageIndex > 0) {
        setSelectedImageIndex((prev) => prev - 1);
      } else if (filteredImages.length === 1) {
        // If this is the last image, reset to 0
        setSelectedImageIndex(0);
      }
    }

    // Clear detection results if we removed the currently displayed image
    if (filteredImages[selectedImageIndex]?.id === imageId) {
      setDetectionResults(null);
    }
  };

  const handleRestoreImage = (imageId: string) => {
    setRemovedImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "processing":
      case "pending":
        return <Clock className="w-6 h-6 text-blue-500 animate-spin" />;
      case "failed":
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Clock className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "processing":
        return "text-blue-600 bg-blue-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "failed":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

 const handleCreateBlueprint = useCallback(async () => {
  try {
    if (filteredImages.length === 0) {
      alert("No images available to create blueprint");
      return;
    }

  
    setError(null);

    // Build image pair data with actual files
    const imagePairs = await Promise.all(
      filteredImages.map(async (image) => {
        const imageResponse = await fetch(image.path);
        const imageBlob = await imageResponse.blob();
        const imageFile = new File([imageBlob], image.name, { type: imageBlob.type });
        const detectionResult = imageDetectionResults.get(image.id) || null;

        return {
          imageFile,
          detection_result: detectionResult,
          imageId: image.id,
          imageName: image.name,
          pageNumber: image.pageNumber,
        };
      })
    );

    // Prepare multipart form data
    const formData = new FormData();

    // Basic blueprint fields
    formData.append("name", blueprintData.name || "");
    formData.append("description", blueprintData.description || "");
    formData.append("version", blueprintData.version || "");
    formData.append("status", blueprintData.status || "");
    formData.append("type", blueprintData.type || "");
    formData.append("project_object_id", blueprintData.project_object_id || "");

    // Append all images & metadata
    imagePairs.forEach((pair, index) => {
      // Append the image file
      formData.append(`images`, pair.imageFile, pair.imageName);

      // Create metadata for this image
      const metadata = {
        imageIndex: index,
        imageId: pair.imageId,
        imageName: pair.imageName,
        pageNumber: pair.pageNumber,
        hasDetectionResult: !!pair.detection_result,
        detection_result: pair.detection_result || null,
      };

      // Append metadata as individual entries (this matches backend expectation)
      formData.append(`image_metadata`, JSON.stringify(metadata));
    });

    // Also send image_pairs data for backend compatibility
    const imagePairsData = imagePairs.map((pair, index) => ({
      imageIndex: index,
      imageId: pair.imageId,
      imageName: pair.imageName,
      pageNumber: pair.pageNumber,
      hasDetectionResult: !!pair.detection_result,
      detection_result: pair.detection_result || null,
      svg_overlay: null, // We're not using SVG overlays in this flow
    }));
    
    formData.append("image_pairs", JSON.stringify(imagePairsData));
    formData.append("image_count", imagePairs.length.toString());

    // Debug logging for verification
    console.log("======> Blueprint form data:");
    console.log("======> Image pairs data:", imagePairsData);
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else if (key === 'image_pairs') {
        console.log(`${key}: ${value} (parsed:`, JSON.parse(value as string), ')');
      } else {
        console.log(`${key}: ${value}`);
      }
    }

  
    // ✅ Important: Don't set Content-Type manually for FormData!
    const apiResponse = await fetch("http://localhost:8989/api/v1/blueprints/create-blueprint", {
      method: "POST",
   
      body: formData,
      credentials: "include", // optional if your API requires cookies/auth
    });

    if (!apiResponse.ok) {
      const text = await apiResponse.text();
      throw new Error(`Blueprint creation failed: ${apiResponse.status} ${text}`);
    }

    const result = await apiResponse.json();

    console.log("✅ Blueprint created:", result);
    // router.push("/blueprints");
  } catch (error) {
    console.error("❌ Error creating blueprint:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    alert("Error creating blueprint: " + errorMessage);
  } 
}, [
filteredImages
]);

  // Keep the original function for navigation to form
  const handleContinueToForm = () => {
    if (filteredImages.length > 0) {
      // Pass the filtered images data to the blueprint creation form with SVG overlays
      const imagesWithOverlays = filteredImages.map(image => ({
        ...image,
        svgOverlay: svgOverlays.get(image.id) || null
      }));
      
      const imageData = encodeURIComponent(JSON.stringify(imagesWithOverlays));
      router.push(
        `/create-blueprint?processedImages=${imageData}&jobId=${jobId}`
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-12 h-12 text-blue-500 animate-spin w-7xl mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading job status...
          </h2>
          <p className="text-gray-600">
            Please wait while we fetch the processing status.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/create-blueprint")}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Upload
          </button>
        </div>
      </div>
    );
  }

  if (!jobStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Job not found
          </h2>
          <p className="text-gray-600">
            The processing job could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl  px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Blueprint Processing
                </h1>
                <p className="text-xs text-gray-600">Job ID: {jobId}</p>
              </div>
            </div>

            <div className="mt-">
              <div className="flex justify-start gap-44 text-sm text-gray-600 mb-2">
                <span className="flex justify-start gap-2 item-center font-semibold">
                  {getStatusIcon(jobStatus.status)}{" "}
                  {jobStatus.progress.processed} of {jobStatus.progress.total}{" "}
                  processed
                </span>
                <span
                  className={`px-3 py-1  rounded-full text-sm font-medium ${getStatusColor(
                    jobStatus.status
                  )}`}
                >
                  {jobStatus.status.charAt(0).toUpperCase() +
                    jobStatus.status.slice(1)}
                </span>
              </div>
              {/* <div className="w-96 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      jobStatus.progress.total > 0
                        ? (jobStatus.progress.processed /
                            jobStatus.progress.total) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div> */}
            </div>
          </div>

          {/* Progress Bar */}
        </div>

        {/* Error Display */}
        {jobStatus.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Processing Error
                </h3>
                <p className="text-sm text-red-700 mt-1">{jobStatus.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Blueprint Information */}
        {blueprintData && (
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-900 mb-3">
              Blueprint Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 font-medium">{blueprintData.name}</span>
              </div>
              <div>
                <span className="text-gray-600">Version:</span>
                <span className="ml-2 font-medium">{blueprintData.version}</span>
              </div>
              <div>
                <span className="text-gray-600">Type:</span>
                <span className="ml-2 font-medium">{blueprintData.type}</span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className="ml-2 font-medium">{blueprintData.status}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Description:</span>
                <span className="ml-2 font-medium">{blueprintData.description}</span>
              </div>
            </div>
          </div>
        )}

        {/* Processed Images */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Processed Images ({filteredImages.length})
              </h2>
              {removedImages.size > 0 && (
                <p className="text-sm text-gray-500">
                  {removedImages.size} image
                  {removedImages.size !== 1 ? "s" : ""} removed
                </p>
              )}
            </div>

            {filteredImages.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setViewMode(
                      viewMode === "fullscreen" ? "grid" : "fullscreen"
                    )
                  }
                  className="inline-flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {viewMode === "fullscreen" ? (
                    <>
                      <Grid3x3 className="w-4 h-4 mr-1" />
                      Grid View
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-1" />
                      Full Screen
                    </>
                  )}
                </button>

                {viewMode === "fullscreen" && (
                  <button
                    onClick={handleViewDetection}
                    disabled={isDetecting}
                    className={`inline-flex items-center px-4 py-2 rounded-md ${
                      isDetecting
                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {isDetecting ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Detecting...
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        View Detection
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {filteredImages.length === 0 ? (
            <div className="text-center py-8">
              <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {jobStatus.status === "processing" ||
                jobStatus.status === "pending"
                  ? "Processing files... Images will appear here as they are processed."
                  : removedImages.size > 0
                  ? "All images have been removed. Use the restore section below to bring them back."
                  : "No images have been processed yet."}
              </p>
            </div>
          ) : viewMode === "fullscreen" ? (
            /* Full Screen Mode - Show large preview with navigation hint */
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden">
                {filteredImages[selectedImageIndex] ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={filteredImages[selectedImageIndex].path}
                      alt={filteredImages[selectedImageIndex].name}
                      className="max-w-full max-h-full object-contain cursor-pointer"
                      onClick={() => setViewerOpen(true)}
                      onLoad={() =>
                        console.log(
                          "Image loaded successfully:",
                          filteredImages[selectedImageIndex].path
                        )
                      }
                      onError={(e) => {
                        console.error(
                          "Image failed to load:",
                          filteredImages[selectedImageIndex].path
                        );
                        // Create a fallback inline SVG
                        const fallbackSvg = `data:image/svg+xml;base64,${btoa(`
                          <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                            <rect width="100%" height="100%" fill="#fee2e2"/>
                            <text x="50%" y="40%" font-family="Arial" font-size="16" fill="#dc2626" text-anchor="middle" dominant-baseline="middle">
                              Image Loading Error
                            </text>
                            <text x="50%" y="60%" font-family="Arial" font-size="12" fill="#7f1d1d" text-anchor="middle" dominant-baseline="middle">
                              ${filteredImages[selectedImageIndex].name}
                            </text>
                          </svg>
                        `)}`;
                        e.currentTarget.src = fallbackSvg;
                      }}
                    />

                    {/* Remove button overlay */}
                    <button
                      onClick={(e) =>
                        handleRemoveImage(
                          filteredImages[selectedImageIndex].id,
                          e
                        )
                      }
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
                      title="Remove this image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Click overlay */}
                    <div className="absolute inset-0 hover:bg-black/40 bg-opacity-0 hover:bg-opacity-10 transition-all flex items-center justify-center">
                      <div className="opacity-0 hover:opacity-100 transition-opacity">
                        <div className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                          <Eye className="w-4 h-4" />
                          <span>Click to view full screen</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500">
                    <FileImage className="w-12 h-12 mx-auto mb-2" />
                    <p>No image selected</p>
                  </div>
                )}
              </div>

              {/* Image info and navigation */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {filteredImages[selectedImageIndex]?.name}
                  </h3>
                  {filteredImages[selectedImageIndex]?.pageNumber && (
                    <p className="text-sm text-gray-500">
                      Page {filteredImages[selectedImageIndex].pageNumber}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    {selectedImageIndex + 1} of {filteredImages.length}
                  </div>
                  {filteredImages[selectedImageIndex] && (
                    <button
                      onClick={() =>
                        handleRemoveImage(filteredImages[selectedImageIndex].id)
                      }
                      className="inline-flex items-center px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Thumbnail navigation */}
              {filteredImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {filteredImages.map((image, index) => (
                    <div key={image.id} className="relative flex-shrink-0">
                      <button
                        onClick={() => setSelectedImageIndex(index)}
                        className={`w-16 h-16 rounded border-2 overflow-hidden ${
                          index === selectedImageIndex
                            ? "border-blue-500"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image.path}
                          alt={image.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPk5BPC90ZXh0Pjwvc3ZnPg==";
                          }}
                        />
                      </button>
                      <button
                        onClick={(e) => handleRemoveImage(image.id, e)}
                        className="absolute -top-1 -right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
                        title="Remove this image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Debug Info (remove in production) */}
              {process.env.NODE_ENV === "development" && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                  <details>
                    <summary className="cursor-pointer font-medium">
                      Debug Info
                    </summary>
                    <div className="mt-2 space-y-1">
                      <p>
                        <strong>Selected Index:</strong> {selectedImageIndex}
                      </p>
                      <p>
                        <strong>Image Path:</strong>{" "}
                        {filteredImages[selectedImageIndex]?.path}
                      </p>
                      <p>
                        <strong>Total Images:</strong> {filteredImages.length}
                      </p>
                      <p>
                        <strong>Removed Images:</strong> {removedImages.size}
                      </p>
                      <p>
                        <strong>Job Status:</strong> {jobStatus.status}
                      </p>
                    </div>
                  </details>
                </div>
              )}
            </div>
          ) : (
            /* Grid Mode - Original small boxes */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredImages.map((image, index) => (
                <div
                  key={image.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow relative group"
                >
                  <div
                    className="aspect-video bg-gray-100 flex items-center justify-center cursor-pointer"
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setViewerOpen(true);
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.path}
                      alt={image.name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==";
                      }}
                    />
                  </div>

                  {/* Remove button - appears on hover */}
                  <button
                    onClick={(e) => handleRemoveImage(image.id, e)}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                    title="Remove this image"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm truncate">
                          {image.name}
                        </h3>
                        {image.pageNumber && (
                          <p className="text-xs text-gray-500 mt-1">
                            Page {image.pageNumber}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleRemoveImage(image.id, e)}
                        className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remove this image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Removed Images Section */}
        {removedImages.size > 0 && (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Removed Images ({removedImages.size})
              </h2>
              <button
                onClick={() => {
                  // Restore all images
                  setRemovedImages(new Set());
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Restore All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {jobStatus?.processedImages
                .filter((image) => removedImages.has(image.id))
                .map((image) => (
                  <div
                    key={image.id}
                    className="border border-gray-300 rounded-lg overflow-hidden bg-white opacity-75 hover:opacity-100 transition-opacity"
                  >
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.path}
                        alt={image.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==";
                        }}
                      />
                    </div>
                    <div className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-700 text-sm truncate">
                            {image.name}
                          </h3>
                          {image.pageNumber && (
                            <p className="text-xs text-gray-500 mt-1">
                              Page {image.pageNumber}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRestoreImage(image.id)}
                          className="ml-2 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          title="Restore this image"
                        >
                          Restore
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => router.push("/create-blueprint")}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Upload
          </button>

          {jobStatus.status === "completed" && filteredImages.length > 0 && (
            <div className="flex space-x-3">
              <button
                onClick={handleContinueToForm}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50"
              >
                Continue to Form
              </button>
              <button
                onClick={handleCreateBlueprint}
                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Blueprint
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Full Screen Image Viewer */}
      <FullScreenImageViewer
        images={filteredImages}
        initialIndex={selectedImageIndex}
        isOpen={viewerOpen}
        onClose={() => {
          setViewerOpen(false);
          setDetectionResults(null); // Clear detection results when closing
        }}
        detectionResults={detectionResults}
        onSvgOverlayUpdate={(imageId, svgData) => {
          // Just log for debugging - we're storing detection results instead
          console.log('SVG overlay updated for image:', imageId, svgData ? 'with data' : 'cleared');
        }}
      />
    </div>
  );
}
