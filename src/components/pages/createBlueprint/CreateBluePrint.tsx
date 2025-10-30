"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBlueprints } from "@/hooks/useBlueprints/useBlueprints";
import Header from "@/components/pages/createBlueprint/Header";
import BlueprintFormFields from "@/components/pages/createBlueprint/BlueprintFormFields";
import ErrorMessage from "@/components/pages/createBlueprint/ErrorMessage";
import FullScreenImageViewer from "@/components/shared/FullScreenImageViewer";
import FileUploadSection from "@/components/pages/createBlueprint/FileUploadSection";
import ProcessedImagesSection from "@/components/pages/createBlueprint/ProcessedImagesSection";
import PDFHandler from "@/components/shared/pdf/PDFHandler";
import { ProcessedImage, BlueprintFormData } from "@/@types/interface/blueprint.interface";
import { BLUEPRINT_STATUS_OPTIONS, BLUEPRINT_FORM_DEFAULTS } from "@/constants/blueprints/blueprints.constant";
import {
  validateBlueprintForm,
  validatePdfBlueprintForm,
  buildBlueprintFormData,
  buildPdfBlueprintFormData,
  buildFormParams,
} from "@/utils/blueprintHelpers";
import { ArrowRight, Loader2 } from "lucide-react";

export default function CreateBlueprint({
  initialProjectId = "",
}: {
  initialProjectId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<BlueprintFormData>({
    name: "",
    description: "",
    version: BLUEPRINT_FORM_DEFAULTS.version,
    status: BLUEPRINT_FORM_DEFAULTS.status,
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
//   useEffect(() => {
//     const imagesParam = searchParams.get("processedImages");
//     if (imagesParam) {
//       try {
//         const images = JSON.parse(decodeURIComponent(imagesParam));
//         setProcessedImages(images);
//       } catch (error) {
//         console.error("Error parsing processed images:", error);
//       }
//     }
//   }, [searchParams]);

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

    setError("");

    try {
      const filesArray = Array.from(files);
      const hasPDF = filesArray.some(file => file.type === "application/pdf");
      
      if (hasPDF) {
        // If PDF, open PDF editor immediately (no server upload yet)
        if (filesArray.length > 1) {
          setError("Please upload only one PDF file at a time");
          return;
        }

        const pdfFile = filesArray[0];
        setPdfFile(pdfFile);
        setShowPdfEditor(true);
        return;
      }
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

  const handlePdfBack = () => {
    setShowPdfEditor(false);
    setPdfFile(null);
  };

  const handlePdfNext = async (annotatedPdfBlob: Blob, pages: any[]) => {
    const validationError = validatePdfBlueprintForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    try {
      const fd = buildPdfBlueprintFormData(
        form,
        annotatedPdfBlob,
        pdfFile?.name || "blueprint.pdf",
        pages.length
      );

      console.log("Creating blueprint from PDF:", {
        name: form.name,
        description: form.description,
        page_count: pages.length,
      });

      await handleNewBlueprint(fd);
      router.push("/blueprints");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create blueprint from PDF";
      setError(message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateBlueprintForm(form, processedImages);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    try {
      const fd = await buildBlueprintFormData(form, processedImages, svgOverlays);
      await handleNewBlueprint(fd);
      router.push("/blueprints");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create blueprint";
      setError(message);
    }
  };
  // If PDF editor is open, show only the PDF editor
  if (showPdfEditor && pdfFile) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handlePdfBack}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                  type="button"
                >
                  <ArrowRight className="w-5 h-5 rotate-180" />
                  <span>Back to Form</span>
                </button>
                <div className="border-l border-gray-300 h-6"></div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {form.name || "Untitled Blueprint"}
                  </h1>
                  <p className="text-sm text-gray-500">
                    Annotate your PDF blueprint
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  // Trigger the export from PDFHandler
                  const exportButton = document.querySelector('[data-pdf-export-button]') as HTMLButtonElement;
                  if (exportButton) {
                    exportButton.click();
                  }
                }}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                type="button"
              >
                <span>Next</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* PDF Editor */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <ErrorMessage message={error} />
            </div>
          )}
          <PDFHandler
            file={pdfFile}
            onExport={handlePdfNext}
            showExportButton={true}
            exportButtonText="Next - Create Blueprint"
          />
        </div>
      </div>
    );
  }

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
          <BlueprintFormFields
            form={form}
            statusOptions={[...BLUEPRINT_STATUS_OPTIONS]}
            onInputChange={handleChange}
            onTextareaChange={handleTextareaChange}
            onStatusChange={handleStatusChange}
          />

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
