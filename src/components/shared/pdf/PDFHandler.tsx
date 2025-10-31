"use client";
import React, { useEffect, useState } from "react";
import { usePDFAnnotation } from "@/hooks/usePDFAnnotation";
import PDFCanvasViewer from "./PDFCanvasViewer";
import PDFToolbar from "./PDFToolbar";
import PageThumbnails from "./PageThumbnails";
import { PDFExportOptions } from "@/@types/pdf/pdfAnnotation.interface";
import { Loader2, FileWarning, Upload, ArrowUpRight } from "lucide-react";

interface PDFHandlerProps {
  file: File | null;
  onPagesChange?: (exportData: { blob: Blob; fileName: string }) => void;
  onError?: (error: string) => void;
  onExport?: (annotatedPdfBlob: Blob, pages: any[]) => Promise<void>;
  showExportButton?: boolean;
  exportButtonText?: string;
  externalPDFHook?: ReturnType<typeof usePDFAnnotation>; // Allow external hook
  onLoadingProgress?: (loaded: number, total: number) => void;
}

const PDFHandler: React.FC<PDFHandlerProps> = ({
  file,
  onPagesChange,
  onError,
  onExport: customOnExport,
  showExportButton = true,
  exportButtonText,
  externalPDFHook,
  onLoadingProgress,
}) => {
  // Use external hook if provided, otherwise create internal one
  const internalHook = usePDFAnnotation();
  const {
    state,
    loadPDF,
    setCurrentPage,
    setZoom,
    setTool,
    setToolSettings,
    addDrawing,
    addText,
    addShape,
    updateText,
    rotatePage,
    deletePage,
    reorderPages,
    duplicatePage,
    undo,
    redo,
    clearPageAnnotations,
    exportPDF,
    isLoading,
    error,
    allPagesLoaded,
    loadedPagesCount,
  } = externalPDFHook || internalHook;

  const [isDrawing, setIsDrawing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [detectionCache, setDetectionCache] = useState<Map<number, any>>(new Map());

  const dataUrlToFile = async (dataUrl: string, fileName: string) => {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const extension = blob.type.split("/")[1] || "jpeg";
    const normalizedName = fileName.toLowerCase().endsWith(`.${extension}`)
      ? fileName
      : `${fileName}.${extension}`;
    return new File([blob], normalizedName, { type: blob.type });
  };

  // Temporary detection view functionality
  const viewDetection = async () => {
    if (typeof window === "undefined" || isDetecting) return;

    setDetectionError(null);

    // Get the current page data
    const currentPageData = state.pages.find(
      (p) => p.pageNumber === state.currentPage
    );

    if (!currentPageData) {
      setDetectionError("Current page is still loading. Please try again.");
      return;
    }

    try {
      setIsDetecting(true);

      let payload = detectionCache.get(currentPageData.pageNumber);

      if (!payload) {
        const baseName = file?.name?.replace(/\.pdf$/i, "") || "blueprint";
        const pageFileName = `${baseName}_page_${currentPageData.pageNumber}`;
        const fileForDetection = await dataUrlToFile(
          currentPageData.dataUrl,
          pageFileName
        );

        const formData = new FormData();
        formData.append("image", fileForDetection);

        const response = await fetch("http://localhost:5050/detect", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Detection failed with status ${response.status}`);
        }

        const detectionResult = await response.json();

        payload = {
          file_url: currentPageData.dataUrl,
          svg_overlay_url: detectionResult,
        };

        setDetectionCache((prev) => {
          const next = new Map(prev);
          next.set(currentPageData.pageNumber, payload);
          return next;
        });
      }

      const key = `blueprint_detection_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;

      try {
        localStorage.setItem(key, JSON.stringify(payload));
      } catch (err) {
        const encoded = encodeURIComponent(JSON.stringify(payload));
        const url = `/blueprint-detection?data=${encoded}`;
        window.open(url, "_blank");
        return;
      }

      const url = `/blueprint-detection?key=${encodeURIComponent(key)}`;
      window.open(url, "_blank");
    } catch (err) {
      console.error("Failed to open detection page", err);
      const message =
        err instanceof Error ? err.message : "Unable to process detection";
      setDetectionError(message);
    } finally {
      setIsDetecting(false);
    }
  };

  // Load PDF when file changes (only if not using external hook)
  useEffect(() => {
    if (file && !externalPDFHook) {
      loadPDF(file);
    }
  }, [file, loadPDF, externalPDFHook]);

  // Report errors to parent
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // Report loading progress to parent
  useEffect(() => {
    if (onLoadingProgress && state.totalPages > 0) {
      onLoadingProgress(loadedPagesCount, state.totalPages);
    }
  }, [loadedPagesCount, state.totalPages, onLoadingProgress]);

  const currentPageData = state.pages.find(
    (p) => p.pageNumber === state.currentPage
  );

  const pageHistory = state.history[state.currentPage];
  const canUndo = pageHistory?.past && pageHistory.past.length > 0;
  const canRedo = pageHistory?.future && pageHistory.future.length > 0;

  const handleExport = async () => {
    const options: PDFExportOptions = {
      includeAnnotations: true,
      format: "pdf",
    };

    const blob = await exportPDF(options);
    
    if (blob) {
      // If custom export handler provided, use it
      if (customOnExport) {
        await customOnExport(blob, state.pages);
      }
      
      // Also call onPagesChange if provided (backward compatibility)
      if (onPagesChange) {
        const fileName = file?.name.replace(".pdf", "_annotated.pdf") || "annotated.pdf";
        onPagesChange({ blob, fileName });
      }
    }
  };

  // No file uploaded state
  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
        <Upload size={64} className="text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No PDF file selected
        </h3>
        <p className="text-sm text-gray-500">
          Upload a PDF file to start annotating
        </p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg">
        <Loader2 size={64} className="text-blue-500 animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Loading PDF...
        </h3>
        <p className="text-sm text-gray-500">
          Please wait while we process your file
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-red-50 border-2 border-red-300 rounded-lg">
        <FileWarning size={64} className="text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">
          Error Loading PDF
        </h3>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  // Main PDF viewer - show loading if current page not loaded yet
  if (!currentPageData) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg">
        <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
        <p className="text-gray-700 font-medium">Loading page {state.currentPage}...</p>
        <p className="text-sm text-gray-500 mt-1">
          Page {state.currentPage} of {state.totalPages}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden relative">
      {/* Toolbar */}
      <PDFToolbar
        selectedTool={state.selectedTool}
        onToolSelect={setTool}
        toolColor={state.toolSettings.color}
        onColorChange={(color) => setToolSettings({ color })}
        toolWidth={state.toolSettings.width}
        onWidthChange={(width) => setToolSettings({ width })}
        fontSize={state.toolSettings.fontSize}
        onFontSizeChange={(fontSize) => setToolSettings({ fontSize })}
        currentPage={state.currentPage}
        totalPages={state.totalPages}
        onPageChange={setCurrentPage}
        zoom={state.zoom}
        onZoomChange={setZoom}
        onRotatePage={() => rotatePage(state.currentPage, 90)}
        onDeletePage={() => deletePage(state.currentPage)}
        onUndo={() => undo(state.currentPage)}
        onRedo={() => redo(state.currentPage)}
        onClearPage={() => clearPageAnnotations(state.currentPage)}
        onExport={handleExport}
        canUndo={canUndo}
        canRedo={canRedo}
        showExportButton={showExportButton}
        exportButtonText={exportButtonText}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Page Thumbnails Sidebar */}
        <PageThumbnails
          pages={state.pages}
          currentPage={state.currentPage}
          onPageSelect={setCurrentPage}
          onReorderPages={reorderPages}
          onDuplicatePage={duplicatePage}
          onDeletePage={deletePage}
        />

        {/* PDF Canvas Viewer */}
        <div className="flex-1 overflow-hidden">
          <PDFCanvasViewer
            page={currentPageData}
            zoom={state.zoom}
            selectedTool={state.selectedTool}
            toolColor={state.toolSettings.color}
            toolWidth={state.toolSettings.width}
            toolOpacity={state.toolSettings.opacity}
            fontSize={state.toolSettings.fontSize}
            isDrawing={isDrawing}
            onDrawingStart={() => setIsDrawing(true)}
            onDrawingEnd={() => setIsDrawing(false)}
            onAddDrawing={(drawing) => addDrawing(state.currentPage, drawing)}
            onAddShape={(shape) => addShape(state.currentPage, shape)}
            onAddText={(text) => addText(state.currentPage, text)}
            onUpdateText={(textId, updates) => updateText(state.currentPage, textId, updates)}
            onAnnotationSelect={() => {}}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-100 border-t border-gray-300 px-4 py-2 flex items-center justify-between text-sm text-gray-600">
        <div>
          <span className="font-medium">{file.name}</span>
          {state.pages[state.currentPage - 1] && (
            <span className="ml-4">
              {state.pages[state.currentPage - 1].width.toFixed(0)} x{" "}
              {state.pages[state.currentPage - 1].height.toFixed(0)} px
            </span>
          )}
        </div>
        <div>
          <span>
            Annotations:{" "}
            {currentPageData.annotations.drawings.length +
              currentPageData.annotations.texts.length +
              currentPageData.annotations.shapes.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PDFHandler;
