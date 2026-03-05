"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import PDFHandler from "@/components/shared/pdf/PDFHandler";
import { FileText, ArrowLeft, Download, ArrowRight, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import useBulkImageUpload from "@/hooks/useBulkImageUpload";

interface PDFViewerSectionProps {
  pdfFile: File | null;
  blueprintName: string;
  onBack: () => void;
  onExportComplete?: (exportData: { blob: Blob; fileName: string }) => void;
  onError?: (error: string) => void;
  externalPDFHook?: any; // External PDF annotation hook
  blueprintId?: string; // Newly created blueprint id for navigation
  versionId?: string; // Optional version id for navigation
  isProcessing?: boolean; // True while images are still uploading to DB via socket
}

const PDFViewerSection: React.FC<PDFViewerSectionProps> = ({
  pdfFile,
  blueprintName,
  onBack,
  onExportComplete,
  onError,
  externalPDFHook,
  blueprintId,
  versionId,
  isProcessing = false,
}) => {
  const router = useRouter();
  const [hasAnnotations, setHasAnnotations] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<{
    loaded: number;
    total: number;
  } | null>(null);
  // Collected canvas edits: { pageId, image }
  const [editCanvasArray, setEditCanvasArray] = useState<
    { pageId: string; image: Blob | string }[]
  >([]);
  const [saving, setSaving] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { uploadBulk, isUploading: isUploadingBulk } = useBulkImageUpload();

  // Lock body scroll while the viewer is open (fullscreen experience)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "auto";
    };
  }, []);

  const handlePDFExport = (exportData: { blob: Blob; fileName: string }) => {
    console.log("PDF exported:", exportData.fileName);
    setHasAnnotations(true);

    if (onExportComplete) {
      onExportComplete(exportData);
    }

    // Auto-download the annotated PDF
    const url = URL.createObjectURL(exportData.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportData.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleError = (error: string) => {
    console.error("PDF Handler error:", error);
    if (onError) {
      onError(error);
    }
  };

  // Stable callback to receive loading progress from PDFHandler without
  // causing re-renders due to a changing function identity.
  const handleLoadingProgress = useCallback((loaded: number, total: number) => {
    setLoadingProgress({ loaded, total });
  }, []);

  // Helper: compress image Blob or data URL to a JPEG data URL (base64)
  const compressImageToDataUrl = async (
    input: Blob | string,
    maxWidth = 1600,
    quality = 0.7
  ): Promise<string> => {
    // Convert string input (data URL) to Image directly, or Blob via object URL
    const img = new Image();
    img.crossOrigin = "anonymous";

    const src = typeof input === "string" ? input : URL.createObjectURL(input);

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
      img.src = src as string;
    });

    // If we created an object URL, revoke it
    if (typeof input !== "string") {
      URL.revokeObjectURL(src as string);
    }

    const scale = Math.min(1, maxWidth / img.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Return full data URL (includes mime + base64)
    return canvas.toDataURL("image/jpeg", quality);
  };

  // Called by external canvas/annotation layer to add/update a page edit
  const addCanvasEdit = (pageId: string, image: Blob | string) => {
    // Debug: log incoming edit details (type/size) to help trace why edits may not appear
    try {
      if (image instanceof Blob) {
        // Blob may not have a reliable size property for some custom types, but usually does
        // eslint-disable-next-line no-console
        console.log("addCanvasEdit called (Blob):", pageId, "size=", image.size, image.type);
      } else {
        // string (likely dataURL)
        // eslint-disable-next-line no-console
        console.log("addCanvasEdit called (string):", pageId, "length=", String(image).length);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log("addCanvasEdit called (unknown type):", pageId, typeof image, err);
    }

    setEditCanvasArray((prev) => {
      const idx = prev.findIndex((p) => p.pageId === pageId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { pageId, image };
        return copy;
      }
      return [...prev, { pageId, image }];
    });
  };

  // Attach the handler to externalPDFHook so the PDF/canvas layer can call it
  useEffect(() => {
    if (!externalPDFHook) return;
    // Attach a named handler to the external hook; this is a lightweight contract
    // The external layer should call `externalPDFHook.registerCanvasEdit(pageId, image)`
    // or `externalPDFHook.registerCanvasEdit(pageId, blobOrDataUrl)` when a canvas edit occurs.
    // We also return a cleanup that removes the reference if it still points to our function.
    // NOTE: this mutates the external hook object which is a common pattern for small integrations.
    // If the external hook provides a registration API, prefer that instead.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    externalPDFHook.registerCanvasEdit = addCanvasEdit;
    // eslint-disable-next-line no-console
    console.log("externalPDFHook.registerCanvasEdit attached");

    return () => {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (externalPDFHook.registerCanvasEdit === addCanvasEdit) delete externalPDFHook.registerCanvasEdit;
        // eslint-disable-next-line no-console
        console.log("externalPDFHook.registerCanvasEdit detached");
      } catch (err) {
        /* noop */
      }
    };
  }, [externalPDFHook]);

  // Debug: log edits array changes so user can see when edits are collected
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("editCanvasArray updated. count=", editCanvasArray.length, editCanvasArray.map((p) => p.pageId));
  }, [editCanvasArray]);

  // Handle SAVE: compress images sequentially (simulating streaming), log each chunk and the final payload
  const handleSaveClick = async () => {
    // If we don't have local collected edits, try to source edited images from the external hook state
    let effectiveEdits = editCanvasArray;
    if ((!effectiveEdits || effectiveEdits.length === 0) && externalPDFHook?.state?.pages) {
      const pagesWithEdits = externalPDFHook.state.pages
        .filter((p: any) => p.editedImage)
        .map((p: any) => ({ pageId: String(p.pageNumber), image: p.editedImage }));
      if (pagesWithEdits.length > 0) {
        console.log("No local editCanvasArray entries; using external hook pages with editedImage", pagesWithEdits.map((p: any) => p.pageId));
        effectiveEdits = pagesWithEdits;
      }
    }

    if (!effectiveEdits || effectiveEdits.length === 0) {
      console.log("No edits to save");
      return;
    }

    setSaving(true);
    try {
      const payload: { pageId: string; image: string; blueprintId?: string; pageNumber?: number }[] = [];

      // Process sequentially to simulate streaming and to limit memory spikes
      for (const e of effectiveEdits) {
        try {
          const dataUrl = await compressImageToDataUrl(e.image, 1600, 0.7);
          // Prefer imageId from externalPDFHook.state.pages when available
          let payloadPageId: string = e.pageId;
          try {
            const pages = externalPDFHook?.state?.pages;
            if (Array.isArray(pages)) {
              const found = pages.find((p: any) => String(p.pageNumber) === String(e.pageId));
              if (found && found.imageId) {
                payloadPageId = String(found.imageId);
              }
            }
          } catch (err) {
            // ignore lookup errors and fall back to e.pageId
          }

          const pageNumber = Number(e.pageId);
          const item = {
            pageId: payloadPageId,
            image: dataUrl,
            blueprintId: blueprintId || undefined,
            pageNumber: Number.isFinite(pageNumber) ? pageNumber : undefined,
          };
          // Simulate streaming by logging each chunk as it's ready
          console.log("Streaming chunk:", item);
          payload.push(item);
        } catch (err) {
          console.error("Failed to compress image for page", e.pageId, err);
        }
      }

      // Final payload (all edits) logged once complete
      console.log("Final payload:", payload);

      // POST the payload to the bulk image upload endpoint using hook
      try {
        const body = await uploadBulk(payload);
        console.log("Bulk upload response:", body);
        alert(`Bulk upload successful: ${payload.length} item(s) sent.`);
      } catch (err: any) {
        console.error("Bulk upload error:", err);
        alert(`Bulk upload failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle edits saved from inner canvas viewer
  const handleSaveEdits = (payload: { pageId: number; editedImage: File | Blob }) => {
    const pageIdStr = String(payload.pageId);

    // Update local array for streaming/compression flow as well
    addCanvasEdit(pageIdStr, payload.editedImage);

    // If external hook exposes setEditedImage, call it so the page object stores editedImage
    try {
      const hookAny = externalPDFHook as any;
      if (hookAny?.setEditedImage) {
        hookAny.setEditedImage(payload.pageId, payload.editedImage);
        console.log("PDFViewerSection: setEditedImage on hook for page", payload.pageId);
      } else {
        // Try mutate state.pages directly as a fallback
        if (hookAny?.state && Array.isArray(hookAny.state.pages)) {
          const idx = hookAny.state.pages.findIndex((p: any) => p.pageNumber === payload.pageId);
          if (idx >= 0) {
            try {
              hookAny.state.pages[idx].editedImage = payload.editedImage;
              console.log("PDFViewerSection: mutated hook.state.pages editedImage for page", payload.pageId);
            } catch (err) {
              console.warn("Failed to mutate external hook state for editedImage", err);
            }
          }
        }
      }
    } catch (err) {
      console.warn("handleSaveEdits failed", err);
    }
  };
  const handleNextClick = () => {
    if (!blueprintId) {
      console.log("No blueprintId available for navigation");
      return;
    }
    // Navigate to the new detection route (dynamic segment)
    let url = `/blueprint_detection/${encodeURIComponent(blueprintId)}`;
    if (versionId) {
      url += `?versionId=${encodeURIComponent(versionId)}`;
    }
    router.push(url);
  };

  const totalSidebarPages =
    externalPDFHook?.state?.pages?.length || loadingProgress?.total || 0;
  const currentSidebarPage = externalPDFHook?.state?.currentPage || 1;

  if (!pdfFile) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No PDF File Available
        </h3>
        <p className="text-gray-600 mb-6">
          Please upload a PDF file to use the annotation tools.
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Upload
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-gray-50 to-white flex flex-col font-sans overflow-hidden">
      {/* Top toolbar/header */}
      <div className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-blue-100 rounded-xl border border-blue-200">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900 tracking-tight">{blueprintName}</div>
            <div className="text-[10px] font-medium text-gray-600 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              PDF Annotation Mode
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {loadingProgress && loadingProgress.loaded < loadingProgress.total && (
            <div className="hidden md:flex flex-col items-end mr-2">
              <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">Loading Pages</div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300" 
                    style={{ width: `${Math.round((loadingProgress.loaded / loadingProgress.total) * 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs font-mono text-gray-900">
                  {Math.round((loadingProgress.loaded / loadingProgress.total) * 100)}%
                </span>
              </div>
            </div>
          )}

          {hasAnnotations && (
            <div className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <Download className="w-3.5 h-3.5 mr-2" />
              ANNOTATIONS SAVED
            </div>
          )}

          <div className="h-8 w-px bg-gray-200 mx-1"></div>

          <button
            onClick={onBack}
            title="Back to Upload"
            className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 hover:text-gray-900 transition-all border border-gray-300 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Cancel</span>
          </button>

          {blueprintId && (
            isProcessing ? (
              <div className="flex items-center gap-3 px-5 py-2.5 bg-amber-100 border border-amber-300 rounded-xl ">
                <svg className="animate-spin h-4 w-4 text-amber-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-md font-bold text-amber-800 ">Uploading Imgaes to server...</span>
              </div>
            ) : (
              <button
                onClick={handleNextClick}
                className="group relative flex items-center justify-center pl-6 pr-5 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-lg shadow-orange-500/20 active:scale-95"
              >
                Go Next
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            )
          )}
        </div>
      </div>

      {/* Main area: sidebar + canvas */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left bookmarks Sidebar */}
        <div
          className={`
            ${isSidebarCollapsed ? "w-14" : "w-56"}
            bg-[#f7f8fb] border-r border-gray-300 flex flex-col z-10 relative transition-all duration-300 ease-in-out
          `}
        >
          

          {!isSidebarCollapsed && (
            <div className="px-3 py-2 border-b border-gray-200 bg-white">
              <button
                onClick={handleSaveClick}
                disabled={saving}
                className={`
                  w-full h-8 rounded-md border text-xs font-semibold transition-colors flex items-center justify-center gap-1.5
                  ${saving
                    ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
                  }
                `}
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                {saving ? "Saving..." : "Apply Edits"}
              </button>
            </div>
          )}

          <div className={`flex-1 overflow-y-auto custom-scrollbar ${isSidebarCollapsed ? "py-2 px-1" : "py-3 px-3"}`}>
            {externalPDFHook && externalPDFHook.state?.pages?.length ? (
              externalPDFHook.state.pages.map((p: any) => {
                const isActive = externalPDFHook.state.currentPage === p.pageNumber;

                return (
                  <div
                    key={p.pageNumber}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer?.setData("text/plain", String(p.pageNumber));
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const from = Number(e.dataTransfer?.getData("text/plain"));
                      if (!isNaN(from)) externalPDFHook?.reorderPages?.(from - 1, p.pageNumber - 1);
                    }}
                    className={isSidebarCollapsed ? "mb-2" : "mb-4"}
                  >
                    {isSidebarCollapsed ? (
                      <button
                        onClick={() => externalPDFHook.setCurrentPage(p.pageNumber)}
                        className={`w-10 h-10 mx-auto rounded-lg border text-xs font-bold transition-colors ${isActive ? "bg-blue-600 border-blue-700 text-white" : "bg-white border-gray-300 text-gray-600 hover:border-blue-400"}`}
                        title={`Page ${p.pageNumber}`}
                      >
                        {p.pageNumber}
                      </button>
                    ) : (
                      <button
                        onClick={() => externalPDFHook.setCurrentPage(p.pageNumber)}
                        className="w-full text-left"
                      >
                        <div className={`relative rounded-md overflow-hidden border bg-white ${isActive ? "border-blue-500 shadow-sm" : "border-gray-300 hover:border-blue-400"}`}>
                          <img
                            src={p.thumbnailUrl || p.dataUrl}
                            alt={`Page ${p.pageNumber}`}
                            className="w-full h-24 object-cover"
                          />
                          <div className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${isActive ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700"}`}>
                            {p.pageNumber}
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-gray-600 text-center">Page {p.pageNumber} of {totalSidebarPages || 0}</div>
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className={`flex flex-col items-center justify-center ${isSidebarCollapsed ? "h-40 px-2" : "h-64 p-8 mx-3 my-3"} text-center bg-gray-100 rounded-3xl border border-gray-300 border-dashed`}>
                <div className="w-12 h-12 bg-gray-200 rounded-2xl flex items-center justify-center mb-4 border border-gray-300">
                  <FileText className="w-6 h-6 text-gray-500" />
                </div>
                {!isSidebarCollapsed && (
                  <div className="text-xs font-bold text-gray-600 uppercase tracking-widest">No pages available</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center editing area */}
        <div className="flex-1 bg-gray-50 flex flex-col relative">
          {/* Subtle noise/gradient overlay for high-end look */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-gray-100/50"></div>

          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-4 bg-white rounded-3xl border border-gray-300 overflow-hidden shadow-lg">
              <div className="h-full bg-gray-50 backdrop-blur-none">
                <PDFHandler
                  file={pdfFile}
                  onPagesChange={handlePDFExport}
                  onError={handleError}
                  externalPDFHook={externalPDFHook}
                  onCanvasEdit={(pageId, image) => {
                    addCanvasEdit(String(pageId), image);
                  }}
                  onSaveEdits={handleSaveEdits}
                  onLoadingProgress={handleLoadingProgress}
                />
              </div>
            </div>
          </div>
          
          {/* Bottom status indicator (Optional) */}
          
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default PDFViewerSection;
