"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import PDFHandler from "@/components/shared/pdf/PDFHandler";
import { FileText, ArrowLeft, Download, Delete, Trash } from "lucide-react";

interface PDFViewerSectionProps {
  pdfFile: File | null;
  blueprintName: string;
  onBack: () => void;
  onExportComplete?: (exportData: { blob: Blob; fileName: string }) => void;
  onError?: (error: string) => void;
  externalPDFHook?: any; // External PDF annotation hook
  blueprintId?: string; // Newly created blueprint id for navigation
}

const PDFViewerSection: React.FC<PDFViewerSectionProps> = ({
  pdfFile,
  blueprintName,
  onBack,
  onExportComplete,
  onError,
  externalPDFHook,
  blueprintId,
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
        console.log("No local editCanvasArray entries; using external hook pages with editedImage", pagesWithEdits.map((p:any)=>p.pageId));
        effectiveEdits = pagesWithEdits;
      }
    }

    if (!effectiveEdits || effectiveEdits.length === 0) {
      console.log("No edits to save");
      return;
    }

    setSaving(true);
    try {
      const payload: { pageId: string; image: string }[] = [];

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

          const item = { pageId: payloadPageId, image: dataUrl };
          // Simulate streaming by logging each chunk as it's ready
          console.log("Streaming chunk:", item);
          payload.push(item);
        } catch (err) {
          console.error("Failed to compress image for page", e.pageId, err);
        }
      }

      // Final payload (all edits) logged once complete
      console.log("Final payload:", payload);

      // POST the payload to the bulk image upload endpoint
      try {
        const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:8989";
        const url = `http://localhost:8989/api/v1/blueprints/images/upload-urls/bulk`;
        console.log("Posting payload to", url);
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.error("Bulk upload failed", res.status, text);
          alert(`Bulk upload failed: ${res.status} ${text}`);
        } else {
          const body = await res.json().catch(() => null);
          console.log("Bulk upload response:", body);
          alert(`Bulk upload successful: ${payload.length} item(s) sent.`);
        }
      } catch (err: any) {
        console.error("Bulk upload error:", err);
        alert("Bulk upload error. See console for details.");
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
    router.push(`/blueprint_detection/${encodeURIComponent(blueprintId)}`);
  };

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
    <div className="fixed inset-0 z-50 bg-gray-900">
      {/* Top toolbar/header */}
      <div className="flex items-center justify-between h-16 px-4 bg-white/5 backdrop-blur border-b border-white/6">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-white" />
          <div className="text-white">
            <div className="font-semibold">{blueprintName}</div>
            <div className="text-xs opacity-80">PDF Annotation Mode</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {loadingProgress && loadingProgress.loaded < loadingProgress.total && (
            <div className="text-sm text-white mr-4">
              {loadingProgress.loaded} / {loadingProgress.total} • {Math.round((loadingProgress.loaded / loadingProgress.total) * 100)}%
            </div>
          )}

          {hasAnnotations && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-600 text-white mr-2">
              <Download className="w-4 h-4 mr-1" />
              Annotations Saved
            </div>
          )}

          <button
            onClick={onBack}
            title="Back"
            className="px-3 py-2 bg-white/6 text-white rounded hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          {blueprintId && (
            <button
              onClick={handleNextClick}
              title="Go to detection"
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Next
            </button>
          )}
         
        </div>
      </div>

      {/* Main area: thumbnails + canvas */}
      <div className="flex h-[calc(100vh-4rem)]"> 
        {/* Left thumbnails */}
        <div className="w-72 bg-white/5 border-r border-white/6 overflow-auto flex flex-col">
          {/* Keep small header spacing */}
          <div className="px-3 pb-2">
            <div className="text-xs text-white/70">Pages ({loadingProgress?.loaded || 0}/{loadingProgress?.total || '–'})</div>
          </div>
           <button
            onClick={handleSaveClick}
            title="Save annotations"
            className="px-3 py-2 bg-white/6 text-white rounded hover:bg-white/10 inline-flex items-center gap-2"
          >
            {saving ? "Saving..." : "SAVE"}
          </button>
          <div className="flex-1 overflow-auto px-3 pb-4 space-y-3">
            {/* Render thumbnails from external hook if available */}
            {externalPDFHook && externalPDFHook.state?.pages?.length ? (
              externalPDFHook.state.pages.map((p: any, idx: number) => {
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
  className={`
    group flex items-center justify-between gap-3 w-full
    p-2 rounded-xl mt-3 backdrop-blur 
    transition-all border cursor-grab
    ${isActive
      ? "bg-white/15 border-blue-500 ring-2 ring-blue-400 shadow-lg shadow-blue-500/20"
      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30 hover:shadow-md hover:shadow-white/10"
    }
    active:cursor-grabbing
  `}
>
  <button
    onClick={() => externalPDFHook.setCurrentPage(p.pageNumber)}
    className="flex items-center gap-3 w-full text-left"
  >
    {/* Thumbnail */}
    <div className="
      w-16 h-22 rounded-lg overflow-hidden border transition-all 
      bg-black/30 border-white/10 shadow-sm
      group-hover:border-blue-400 group-hover:shadow-blue-400/20 group-hover:shadow
    ">
      <img
        src={p.thumbnailUrl || p.dataUrl}
        alt={`Page ${p.pageNumber}`}
        className="object-cover w-full h-full"
      />
    </div>

    <div className="flex flex-col">
      <span className="text-sm font-semibold text-white">
        Page {p.pageNumber}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-white/50 group-hover:text-white/80 transition">
          Drag to reorder
        </span>
        {p.imageId && (
          <span title={p.imageId} className="text-[11px] text-white/40 italic">
            ID: {String(p.imageId).slice(0, 8)}
          </span>
        )}
      </div>
    </div>
  </button>

  {/* Delete button */}
  <button
    title="Delete Page"
    onClick={(e) => {
      e.stopPropagation();
      if (!confirm(`Delete page ${p.pageNumber}?`)) return;
      externalPDFHook?.deletePage?.(p.pageNumber);
    }}
    className="
      p-2 rounded-lg transition
      text-red-400 hover:text-white
      hover:bg-red-500/20 active:bg-red-500/40
    "
  >
    <Trash size={18} />
  </button>
</div>


                );
              })
            ) : (
              <div className="text-sm text-white/60">No pages yet</div>
            )}
          </div>
        </div>

        {/* Center editing area */}
        <div className="flex-1 bg-gray-800 overflow-hidden flex flex-col">
         

          <div className="flex-1 overflow-auto">
            <div className="h-full ">
              <div className="h-full bg-white rounded shadow-lg overflow-hidden">
                <PDFHandler
                  file={pdfFile}
                  onPagesChange={handlePDFExport}
                  onError={handleError}
                  externalPDFHook={externalPDFHook}
                  onCanvasEdit={(pageId, image) => {
                    // PDFHandler/PDFCanvasViewer provide pageId as number; coerce to string
                    addCanvasEdit(String(pageId), image);
                  }}
                  onSaveEdits={handleSaveEdits}
                  onLoadingProgress={handleLoadingProgress}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewerSection;
