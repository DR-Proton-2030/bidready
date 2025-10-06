"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  FileImage,
  ArrowLeft,
  Eye,
  Grid3x3,
} from "lucide-react";
import FullScreenImageViewer from "@/components/shared/FullScreenImageViewer";

interface ProcessedImage {
  id: string;
  name: string;
  path: string;
  pageNumber?: number;
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

  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"fullscreen" | "grid">("fullscreen");

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

  const handleContinueToForm = () => {
    if (jobStatus && jobStatus.processedImages.length > 0) {
      // Pass the processed images data to the blueprint creation form
      const imageData = encodeURIComponent(
        JSON.stringify(jobStatus.processedImages)
      );
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

        {/* Processed Images */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Processed Images ({jobStatus.processedImages.length})
            </h2>

            {jobStatus.processedImages.length > 0 && (
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
                    onClick={() => {
                      setSelectedImageIndex(0);
                      setViewerOpen(true);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Images
                  </button>
                )}
              </div>
            )}
          </div>

          {jobStatus.processedImages.length === 0 ? (
            <div className="text-center py-8">
              <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {jobStatus.status === "processing" ||
                jobStatus.status === "pending"
                  ? "Processing files... Images will appear here as they are processed."
                  : "No images have been processed yet."}
              </p>
            </div>
          ) : viewMode === "fullscreen" ? (
            /* Full Screen Mode - Show large preview with navigation hint */
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden">
                {jobStatus.processedImages[selectedImageIndex] ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={jobStatus.processedImages[selectedImageIndex].path}
                      alt={jobStatus.processedImages[selectedImageIndex].name}
                      className="max-w-full max-h-full object-contain cursor-pointer"
                      onClick={() => setViewerOpen(true)}
                      onLoad={() =>
                        console.log(
                          "Image loaded successfully:",
                          jobStatus.processedImages[selectedImageIndex].path
                        )
                      }
                      onError={(e) => {
                        console.error(
                          "Image failed to load:",
                          jobStatus.processedImages[selectedImageIndex].path
                        );
                        // Create a fallback inline SVG
                        const fallbackSvg = `data:image/svg+xml;base64,${btoa(`
                          <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                            <rect width="100%" height="100%" fill="#fee2e2"/>
                            <text x="50%" y="40%" font-family="Arial" font-size="16" fill="#dc2626" text-anchor="middle" dominant-baseline="middle">
                              Image Loading Error
                            </text>
                            <text x="50%" y="60%" font-family="Arial" font-size="12" fill="#7f1d1d" text-anchor="middle" dominant-baseline="middle">
                              ${jobStatus.processedImages[selectedImageIndex].name}
                            </text>
                          </svg>
                        `)}`;
                        e.currentTarget.src = fallbackSvg;
                      }}
                    />

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
                    {jobStatus.processedImages[selectedImageIndex]?.name}
                  </h3>
                  {jobStatus.processedImages[selectedImageIndex]
                    ?.pageNumber && (
                    <p className="text-sm text-gray-500">
                      Page{" "}
                      {jobStatus.processedImages[selectedImageIndex].pageNumber}
                    </p>
                  )}
                </div>

                <div className="text-sm text-gray-500">
                  {selectedImageIndex + 1} of {jobStatus.processedImages.length}
                </div>
              </div>

              {/* Thumbnail navigation */}
              {jobStatus.processedImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {jobStatus.processedImages.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
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
                        {jobStatus.processedImages[selectedImageIndex]?.path}
                      </p>
                      <p>
                        <strong>Total Images:</strong>{" "}
                        {jobStatus.processedImages.length}
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
              {jobStatus.processedImages.map((image, index) => (
                <div
                  key={image.id}
                  className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setSelectedImageIndex(index);
                    setViewerOpen(true);
                  }}
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
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => router.push("/create-blueprint")}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Upload
          </button>

          {jobStatus.status === "completed" &&
            jobStatus.processedImages.length > 0 && (
              <button
                onClick={handleContinueToForm}
                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Continue to Blueprint Form
              </button>
            )}
        </div>
      </div>

      {/* Full Screen Image Viewer */}
      <FullScreenImageViewer
        images={jobStatus.processedImages}
        initialIndex={selectedImageIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}
