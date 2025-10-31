"use client";
import React, { useState, useEffect } from "react";
import PDFHandler from "@/components/shared/pdf/PDFHandler";
import { FileText, ArrowLeft, Download, Delete, Trash } from "lucide-react";

interface PDFViewerSectionProps {
  pdfFile: File | null;
  blueprintName: string;
  onBack: () => void;
  onExportComplete?: (exportData: { blob: Blob; fileName: string }) => void;
  onError?: (error: string) => void;
  externalPDFHook?: any; // External PDF annotation hook
}

const PDFViewerSection: React.FC<PDFViewerSectionProps> = ({
  pdfFile,
  blueprintName,
  onBack,
  onExportComplete,
  onError,
  externalPDFHook,
}) => {
  const [hasAnnotations, setHasAnnotations] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<{
    loaded: number;
    total: number;
  } | null>(null);

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
                  onLoadingProgress={(loaded, total) => setLoadingProgress({ loaded, total })}
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
