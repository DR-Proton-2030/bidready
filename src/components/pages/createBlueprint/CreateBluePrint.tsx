"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBlueprints } from "@/hooks/useBlueprints/useBlueprints";
import Header from "@/components/bluePrints/Header";
import BlueprintFormFields from "@/components/bluePrints/BlueprintFormFields";
import ErrorMessage from "@/components/bluePrints/ErrorMessage";
import FullScreenImageViewer from "@/components/shared/FullScreenImageViewer";
import FileUploadSection from "@/components/bluePrints/FileUploadSection";
import ProcessedImagesSection from "@/components/bluePrints/ProcessedImagesSection";
import PDFViewerSection from "@/components/pages/blueprintProcessing/PDFViewerSection";
import { ProcessedImage, BlueprintFormData } from "@/@types/interface/blueprint.interface";
import { BLUEPRINT_STATUS_OPTIONS, BLUEPRINT_FORM_DEFAULTS } from "@/constants/blueprints/blueprints.constant";
import {
  validateBlueprintForm,
  validatePdfBlueprintForm,
  buildBlueprintFormData,
  buildPdfBlueprintFormData,
  buildFormParams,
} from "@/utils/blueprintHelpers";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import Loader from "@/components/shared/loader/Loader";
import { usePDFAnnotation } from "@/hooks/usePDFAnnotation";
import useCreateBlueprint from "@/hooks/useCreateBlueprint";
import { FieldErrors, TouchedFields } from "@/components/bluePrints/BlueprintFormFields";

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
  const [isUploadingError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const [fullScreenIndex, setFullScreenIndex] = useState(0);

  const [svgOverlays, setSvgOverlays] = useState<Map<string, string | null>>(new Map());
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const { handleNewBlueprint } = useBlueprints();

  // Field-level validation
  const [touched, setTouched] = useState<TouchedFields>({});
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const validateFields = (f: BlueprintFormData): FieldErrors => {
    const errs: FieldErrors = {};
    if (!f.name.trim()) errs.name = "Blueprint title is required";
    if (!f.description.trim()) errs.description = "Description is required";
    if (!f.project_object_id) errs.project_object_id = "Please select a project";
    return errs;
  };

  const handleBlur = (field: keyof BlueprintFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFieldErrors(validateFields(form));
  };

  // State for streaming
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingProgress, setStreamingProgress] = useState(0);
  const [showPdfHandler, setShowPdfHandler] = useState(false);
  const [blueprintId, setBlueprintId] = useState<string>("");


  const [pdfUrl, setPdfUrl] = useState<string>("");

  // PDF Annotation Hook
  const pdfAnnotationHook = usePDFAnnotation();
  const { loadPDFFromUrl, addStreamedImage, state: pdfState } = pdfAnnotationHook;
  // Create-blueprint streaming hook
  const { createBlueprintWithStreaming } = useCreateBlueprint();

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
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);
    if (touched[e.target.name as keyof BlueprintFormData]) {
      setFieldErrors(validateFields(updated));
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);
    if (touched[e.target.name as keyof BlueprintFormData]) {
      setFieldErrors(validateFields(updated));
    }
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
      } catch (e) { }
    };
  }, [pdfFile]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched and validate
    const allTouched: TouchedFields = {
      name: true,
      description: true,
      project_object_id: true,
    };
    setTouched(allTouched);
    const errs = validateFields(form);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setError("Please fill in all required fields.");
      return;
    }

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
      // If a PDF file is present (and no processed images), submit as PDF blueprint with streaming
      if (pdfFile && processedImages.length === 0) {
        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("description", form.description || "");
        fd.append("version", form.version || "");
        fd.append("status", form.status || "");
        fd.append("type", form.type || "");
        fd.append("project_object_id", form.project_object_id);
        fd.append("blueprint_file", pdfFile);

        console.log("📦 Sending PDF FormData:", Array.from(fd.entries()));

        setIsUploading(true);
        setIsStreaming(true);

        // Use the createBlueprintWithStreaming hook to handle the multipart streaming
        setIsUploading(true);
        setIsStreaming(true);

        createBlueprintWithStreaming(fd, {
          onFirstResponse: (data) => {
            try {
              const newBlueprintId = data?.blueprint_id || data?.blueprint?._id || data?.blueprint?.id || data?.data?.blueprint?._id || data?.data?._id;
              const pdfFileUrl = data?.file_url || data?.data?.file_url || data?.data?.blueprint?.file_url || data?.blueprint?.file_url;

              if (newBlueprintId) setBlueprintId(newBlueprintId);
              if (pdfFileUrl) setPdfUrl(pdfFileUrl);

              setIsUploading(false);
              setShowPdfHandler(true);

              const tryLoadUrl = pdfFileUrl || data?.file_url || data?.data?.file_url || data?.blueprint?.file_url;

              if (!tryLoadUrl) {
                setError("Failed to load PDF: backend file URL not found");
                return;
              }

              loadPDFFromUrl(tryLoadUrl).catch(urlErr => {
                console.error("❌ Error loading PDF from backend URL:", urlErr);
                setError("Failed to load PDF from backend URL");
              });
            } catch (e) {
              console.error("onFirstResponse handler error:", e);
            }
          },
          onImageProcessed: (data) => {
            try {
              addStreamedImage(data.image_url, data.page, data.image_id);
              setStreamingProgress(typeof data.progress === 'number' ? data.progress : streamingProgress);
            } catch (e) {
              console.error("onImageProcessed handler error:", e);
            }
          },
          onHeartbeat: (d) => {
            // optional: keep a small log
            console.debug("createBlueprint heartbeat", d);
          },
          onComplete: () => {
            setIsStreaming(false);
            setIsUploading(false);
          },
          onError: (err) => {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
            setIsStreaming(false);
            setIsUploading(false);
          }
        });
      } else {
        // Handle non-PDF blueprint creation
        const fd = await buildBlueprintFormData(form, processedImages, svgOverlays);
        console.log("=====>formdata body", fd)

        const BACKEND_URL =
          process.env.NEXT_PUBLIC_BASE_URL ||
          process.env.NEXT_PUBLIC_BLUEPRINTS_API_URL ||
          "http://localhost:8989/api/v1";

        const token = typeof window !== "undefined" ? localStorage.getItem("@token") : null;
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        setIsUploading(true);
        const res = await fetch(`${BACKEND_URL}/blueprints/create-blueprint`, {
          method: "POST",
          body: fd,
          headers,
        });

        if (!res.ok) {
          let errBody: any = { message: "Failed to create blueprint" };
          try {
            errBody = await res.json();
          } catch (e) { }
          throw new Error(errBody.message || "Failed to create blueprint");
        }

        const data = await res.json().catch(() => null);
        setError("");
        setIsUploading(false);
        console.log("Blueprint created", data);
        router.push("/create-blueprint/plans");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create blueprint";
      setError(message);
      setIsUploading(false);
      setIsStreaming(false);
    }
  };


  // If showing PDF handler, render that instead
  if (showPdfHandler && pdfFile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Indicator */}
          {isStreaming && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">
                  Processing PDF Pages...
                </span>
                <span className="text-sm font-medium text-blue-900">
                  {streamingProgress}%
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${streamingProgress}%` }}
                />
              </div>
              <p className="text-xs text-blue-700 mt-2">
                {pdfState.pages.length} of {pdfState.totalPages} pages loaded
              </p>
            </div>
          )}

          {/* PDF Handler */}
          <PDFViewerSection
            pdfFile={pdfFile}
            blueprintName={form.name || "Untitled Blueprint"}
            onBack={() => {
              setShowPdfHandler(false);
              setPdfFile(null);
              setBlueprintId("");
              setPdfUrl("");
            }}
            onExportComplete={(exportData) => {
              console.log("PDF export complete:", exportData);
              // After export, navigate to plans
              router.push("/create-blueprint/plans");
            }}
            onError={(error) => {
              setError(error);
            }}
            externalPDFHook={pdfAnnotationHook}
            blueprintId={blueprintId}
            isProcessing={isStreaming}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/30 py-8 min-h-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-2">
            <button
              type="button"
              onClick={() => router.push("/blueprints")}
              className="p-2 rounded-lg hover:bg-white/80 text-gray-500 hover:text-gray-700 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Blueprint</h1>
              <p className="text-sm text-gray-500 mt-0.5">Fill out the details and upload your blueprint files</p>
            </div>
          </div>

          {/* Form Fields */}
          <BlueprintFormFields
            form={form}
            statusOptions={[...BLUEPRINT_STATUS_OPTIONS]}
            onInputChange={handleChange}
            onTextareaChange={handleTextareaChange}
            onStatusChange={handleStatusChange}
            fieldErrors={fieldErrors}
            touched={touched}
            onBlur={handleBlur}
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
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start gap-5">
                <div className="w-28 h-36 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                  <object
                    data={pdfPreviewUrl ?? undefined}
                    type="application/pdf"
                    className="w-full h-full"
                    aria-label="PDF preview"
                  >
                    <div className="flex items-center justify-center h-full text-xs text-gray-400">No preview</div>
                  </object>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 truncate">{pdfFile.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{(pdfFile.size / (1024 * 1024)).toFixed(2)} MB</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPdfFile(null)}
                      className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-gray-500 leading-relaxed">
                    PDF uploaded successfully. Click <strong>Create Blueprint</strong> to process and upload.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2 pb-4">
            <button
              type="button"
              onClick={() => router.push("/blueprints")}
              className="px-6 py-2.5 text-sm font-medium border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || (processedImages.length === 0 && !pdfFile)}
              className={`
                px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all shadow-sm
                ${isUploading || (processedImages.length === 0 && !pdfFile)
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-primary text-white hover:opacity-90 shadow-primary/25"
                }
              `}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Create Blueprint
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Full Screen Image Viewer */}
      {isUploading && <Loader />}
    </div>
  );
}
