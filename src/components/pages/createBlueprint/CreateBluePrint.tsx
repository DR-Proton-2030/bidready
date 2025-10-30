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
  
  const [svgOverlays, setSvgOverlays] = useState<Map<string, string | null>>(new Map());
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
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

  const handleImageClick = (index: number) => {
    setFullScreenIndex(index);
    setIsFullScreenOpen(true);
  };

  const handleImageChange = (image: ProcessedImage, index: number) => {
    // No detection flow here. Just open the full screen viewer at the image.
    console.log("Image changed to:", image.name, "at index:", index);
    handleImageClick(index);
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
        // Keep the PDF in state but DO NOT navigate/open the editor automatically.
        // The user can choose to open the PDF editor manually if desired.
        setPdfFile(pdfFile);
  // Do not auto-open editor on upload
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

  // manage object URL for pdf preview and cleanup
  useEffect(() => {
    if (!pdfFile) {
      setPdfPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(pdfFile);
    setPdfPreviewUrl(url);
    return () => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {}
    };
  }, [pdfFile]);

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateBlueprintForm(form, processedImages);
    if (validationError) {
      // Allow submission when a PDF file is present even if processedImages is empty
      const isOnlyPdfCase = pdfFile && processedImages.length === 0;
      if (isOnlyPdfCase && validationError.includes("Please upload and process at least one")) {
        // ignore this particular validation when user uploaded a PDF
      } else {
        setError(validationError);
        return;
      }
    }

    setError("");

    try {
      // If a PDF file is present (and no processed images), submit as PDF blueprint
      if (pdfFile && processedImages.length === 0) {
        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("description", form.description || "");
        fd.append("version", form.version || "");
        fd.append("status", form.status || "");
        fd.append("type", form.type || "");
        fd.append("project_object_id", form.project_object_id);
        fd.append("pdf", pdfFile); // MUST be "pdf"

        console.log("📦 Sending PDF FormData:", Array.from(fd.entries()));

        setIsUploading(true);

        const res = await fetch("/api/blueprints/create-blueprint-only", {
          method: "POST",
          body: fd,
          credentials: "include",
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          throw new Error(errBody?.message || "Failed to create blueprint");
        }

        const data = await res.json();
        setIsUploading(false);
        setError("");
        console.log("✅ Blueprint created (PDF)", data);
      } else {
        const fd = await buildBlueprintFormData(form, processedImages, svgOverlays);
        console.log("=====>formdata body",fd)
        // POST directly to the create-blueprint-only API (FormData)
        setIsUploading(true);
        const res = await fetch("/api/blueprints/create-blueprint-only", {
          method: "POST",
          body: fd,
          // send cookies for authentication if present
          credentials: "include",
        });

        if (!res.ok) {
          let errBody: any = { message: "Failed to create blueprint" };
          try {
            errBody = await res.json();
          } catch (e) {}
          throw new Error(errBody.message || "Failed to create blueprint");
        }

        const data = await res.json().catch(() => null);
        // Keep on the same page; optionally show a success message
        setError("");
        setIsUploading(false);
        // If you want to surface created blueprint data, update state or show toast
        console.log("Blueprint created", data);
      }
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
          <BlueprintFormFields
            form={form}
            statusOptions={[...BLUEPRINT_STATUS_OPTIONS]}
            onInputChange={handleChange}
            onTextareaChange={handleTextareaChange}
            onStatusChange={handleStatusChange}
          />

          {/* File Upload / PDF Preview Section */}
          {processedImages.length === 0 && !pdfFile ? (
            <FileUploadSection
              isUploading={isUploading}
              onFileUpload={handleFileUpload}
            />
          ) : processedImages.length > 0 ? (
            /* Processed Images Preview */
            <ProcessedImagesSection
              images={processedImages}
              onImageClick={handleImageClick}
              onClearImages={handleClearImages}
            />
          ) : pdfFile ? (
            /* PDF Preview Card when a PDF is uploaded but not edited */
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="w-32 h-40 border rounded overflow-hidden bg-gray-50">
                  {/* Small embedded PDF preview using object tag */}
                  <object
                    data={pdfPreviewUrl ?? undefined}
                    type="application/pdf"
                    className="w-full h-full"
                    aria-label="PDF preview"
                  >
                    <div className="p-3 text-sm text-gray-500">Preview not available</div>
                  </object>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{pdfFile.name}</div>
                      <div className="text-xs text-gray-500">{(pdfFile.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPdfFile(null)}
                        className="px-3 py-1 border rounded-md text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">You uploaded a PDF. Click Create Blueprint to upload this PDF as-is, or Remove to cancel.</p>
                </div>
              </div>
            </div>
          ) : null}

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
                disabled={isUploading || (processedImages.length === 0 && !pdfFile)}
                className={`
                  px-6 py-2 rounded-md flex items-center space-x-2
                  ${
                    isUploading || (processedImages.length === 0 && !pdfFile)
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

      {/* no detection overlay */}

      {/* Full Screen Image Viewer */}
      <FullScreenImageViewer
        images={processedImages}
        initialIndex={fullScreenIndex}
        isOpen={isFullScreenOpen}
        onClose={() => {
          setIsFullScreenOpen(false);
        }}
        onImageChange={handleImageChange}
      />
    </div>
  );
}
