"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  PDFViewerState,
  PDFPageData,
  AnnotationTool,
  PageAnnotation,
  DrawingPath,
  TextAnnotation,
  ShapeAnnotation,
  PDFExportOptions,
  CursorMode,
  ToolSettings,
  Point,
  UsePDFAnnotationReturn,
} from "@/@types/pdf/pdfAnnotation.interface";
import * as pdfjsLib from "pdfjs-dist";

// Set worker source - use CDN for correct version match
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;
}

const DEFAULT_TOOL_SETTINGS: ToolSettings = {
  color: "#FF0000",
  width: 2,
  fontSize: 16,
  opacity: 1,
};

export const usePDFAnnotation = (
  maxZoom: number = 3,
  minZoom: number = 0.5,
  defaultZoom: number = 1
): UsePDFAnnotationReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<PDFViewerState>({
    currentPage: 1,
    totalPages: 0,
    zoom: defaultZoom,
    pages: [],
    selectedTool: "select",
    cursorMode: "pan",
    toolSettings: DEFAULT_TOOL_SETTINGS,
    history: {},
    isDrawing: false,
    selectedAnnotationId: null,
  });

  const pdfDocRef = useRef<any>(null);
  const loadedPagesRef = useRef<Set<number>>(new Set());
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [loadedPagesCount, setLoadedPagesCount] = useState(0);
  const [allPagesLoaded, setAllPagesLoaded] = useState(false);

  // Initialize page history
  const initializePageHistory = useCallback((pageNumber: number) => {
    setState((prev) => {
      if (prev.history[pageNumber]) return prev;

      const pageAnnotations: PageAnnotation = {
        pageNumber,
        drawings: [],
        texts: [],
        shapes: [],
      };

      return {
        ...prev,
        history: {
          ...prev.history,
          [pageNumber]: {
            past: [],
            present: pageAnnotations,
            future: [],
          },
        },
      };
    });
  }, []);

  // Method to add streamed images to state
  const addStreamedImage = useCallback((imageUrl: string, pageNumber: number, imageId?: string) => {
    const pageData: PDFPageData = {
      pageNumber,
      dataUrl: imageUrl,
      rotation: 0,
      annotations: {
        pageNumber,
        drawings: [],
        texts: [],
        shapes: [],
      },
      thumbnailUrl: imageUrl,
      imageId: imageId ? String(imageId) : undefined,
      width: 800,
      height: 1000,
    };

    setState((prev) => {
      const existingPageIndex = prev.pages.findIndex(p => p.pageNumber === pageNumber);
      const newPages = [...prev.pages];
      
      if (existingPageIndex >= 0) {
        newPages[existingPageIndex] = pageData;
      } else {
        newPages.push(pageData);
        newPages.sort((a, b) => a.pageNumber - b.pageNumber);
      }

      return {
        ...prev,
        pages: newPages,
        totalPages: Math.max(prev.totalPages, pageNumber),
      };
    });

    loadedPagesRef.current.add(pageNumber);
    initializePageHistory(pageNumber);
    
    const newLoadedCount = loadedPagesRef.current.size;
    setLoadedPagesCount(newLoadedCount);
  }, [initializePageHistory]);

  // Method to load PDF from URL
  const loadPDFFromUrl = useCallback(async (pdfUrl: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;

      pdfDocRef.current = pdf;
      loadedPagesRef.current.clear();
      setLoadedPagesCount(0);
      setAllPagesLoaded(false);

      const totalPages = pdf.numPages;

      setState((prev) => ({
        ...prev,
        pages: [],
        totalPages,
        currentPage: 1,
      }));

      setIsLoading(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load PDF from URL";
      setError(errorMessage);
      setIsLoading(false);
      console.error("PDF loading error:", err);
    }
  }, []);

  // Load a single page
  const loadSinglePage = useCallback(async (pageNum: number) => {
    if (!pdfDocRef.current || loadedPagesRef.current.has(pageNum)) {
      return;
    }

    try {
      setIsLoadingPage(true);
      const page = await pdfDocRef.current.getPage(pageNum);
      // Use lower scale (1.5 instead of 2) for faster loading while maintaining quality
      const viewport = page.getViewport({ scale: 1 });

      // Create canvas for page rendering
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Failed to get canvas context");
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      // Use JPEG with 85% quality for faster loading and smaller file size
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

      // Create thumbnail
      const thumbViewport = page.getViewport({ scale: 0.3 });
      const thumbCanvas = document.createElement("canvas");
      const thumbContext = thumbCanvas.getContext("2d");

      let thumbnailUrl = "";
      if (thumbContext) {
        thumbCanvas.width = thumbViewport.width;
        thumbCanvas.height = thumbViewport.height;

        await page.render({
          canvasContext: thumbContext,
          viewport: thumbViewport,
        }).promise;

        // Use JPEG for thumbnails to reduce memory usage
        thumbnailUrl = thumbCanvas.toDataURL("image/jpeg", 0.8);
      }

      const pageData: PDFPageData = {
        pageNumber: pageNum,
        dataUrl,
        rotation: 0,
        annotations: {
          pageNumber: pageNum,
          drawings: [],
          texts: [],
          shapes: [],
        },
        thumbnailUrl,
        width: viewport.width,
        height: viewport.height,
      };

      setState((prev) => {
        const existingPageIndex = prev.pages.findIndex(p => p.pageNumber === pageNum);
        const newPages = [...prev.pages];
        
        if (existingPageIndex >= 0) {
          newPages[existingPageIndex] = pageData;
        } else {
          newPages.push(pageData);
          newPages.sort((a, b) => a.pageNumber - b.pageNumber);
        }

        return {
          ...prev,
          pages: newPages,
        };
      });

      loadedPagesRef.current.add(pageNum);
      initializePageHistory(pageNum);
      
      // Update loaded pages count
      const newLoadedCount = loadedPagesRef.current.size;
      setLoadedPagesCount(newLoadedCount);
      
      // Check if all pages are loaded
      if (pdfDocRef.current && newLoadedCount === pdfDocRef.current.numPages) {
        setAllPagesLoaded(true);
      }
      
      setIsLoadingPage(false);
    } catch (err) {
      console.error(`Error loading page ${pageNum}:`, err);
      setIsLoadingPage(false);
    }
  }, [initializePageHistory]);

  // Compress PDF by reducing image quality
  const compressPDF = useCallback(async (file: File): Promise<ArrayBuffer> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // For now, just return the original buffer
      // In production, you might want to use a library like pdf-lib to compress images
      // or reduce resolution when rendering pages
      return arrayBuffer;
    } catch (err) {
      console.error("Error compressing PDF:", err);
      return await file.arrayBuffer();
    }
  }, []);

  // Load PDF file - only metadata first
  const loadPDF = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setError(null);

      try {
        // Compress PDF for faster loading
        const arrayBuffer = await compressPDF(file);
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        pdfDocRef.current = pdf;
        loadedPagesRef.current.clear();
        setLoadedPagesCount(0);
        setAllPagesLoaded(false);

        const totalPages = pdf.numPages;

        // Initialize state with empty pages array
        setState((prev) => ({
          ...prev,
          pages: [],
          totalPages,
          currentPage: 1,
        }));

        setIsLoading(false);

        for(let i = 1; i <= totalPages; i++) {
            await loadSinglePage(i);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load PDF";
        setError(errorMessage);
        setIsLoading(false);
        console.error("PDF loading error:", err);
      }
    },
    [loadSinglePage]
  );

  // Navigation and view controls with lazy loading
  const setCurrentPage = useCallback((page: number) => {
    setState((prev) => {
      const newPage = Math.max(1, Math.min(page, prev.totalPages));
      
      // Load current page if not loaded
      if (!loadedPagesRef.current.has(newPage)) {
        loadSinglePage(newPage);
      }
      
      // Preload adjacent pages
      const nextPage = newPage + 1;
      const prevPage = newPage - 1;
      
      if (nextPage <= prev.totalPages && !loadedPagesRef.current.has(nextPage)) {
        setTimeout(() => loadSinglePage(nextPage), 50);
      }
      if (prevPage >= 1 && !loadedPagesRef.current.has(prevPage)) {
        setTimeout(() => loadSinglePage(prevPage), 100);
      }
      
      return {
        ...prev,
        currentPage: newPage,
      };
    });
  }, [loadSinglePage]);

  const setZoom = useCallback(
    (zoom: number) => {
      setState((prev) => ({
        ...prev,
        zoom: Math.max(minZoom, Math.min(zoom, maxZoom)),
      }));
    },
    [minZoom, maxZoom]
  );

  const setTool = useCallback((tool: AnnotationTool) => {
    setState((prev) => ({
      ...prev,
      selectedTool: tool,
      cursorMode: tool === "select" ? "pan" : "draw",
    }));
  }, []);

  const setCursorMode = useCallback((mode: CursorMode) => {
    setState((prev) => ({
      ...prev,
      cursorMode: mode,
    }));
  }, []);

  const setToolSettings = useCallback((settings: Partial<ToolSettings>) => {
    setState((prev) => ({
      ...prev,
      toolSettings: {
        ...prev.toolSettings,
        ...settings,
      },
    }));
  }, []);

  // Annotation operations with history
  const updatePageAnnotations = useCallback(
    (
      pageNumber: number,
      updateFn: (annotations: PageAnnotation) => PageAnnotation
    ) => {
      setState((prev) => {
        const pageIndex = prev.pages.findIndex(
          (p) => p.pageNumber === pageNumber
        );
        if (pageIndex === -1) return prev;

        const currentAnnotations = prev.pages[pageIndex].annotations;
        const newAnnotations = updateFn(currentAnnotations);

        const newPages = [...prev.pages];
        newPages[pageIndex] = {
          ...newPages[pageIndex],
          annotations: newAnnotations,
        };

        // Update history
        const pageHistory = prev.history[pageNumber] || {
          past: [],
          present: currentAnnotations,
          future: [],
        };

        const newHistory = {
          ...prev.history,
          [pageNumber]: {
            past: [...pageHistory.past, pageHistory.present],
            present: newAnnotations,
            future: [],
          },
        };

        return {
          ...prev,
          pages: newPages,
          history: newHistory,
        };
      });
    },
    []
  );

  const addDrawing = useCallback(
    (pageNumber: number, drawing: DrawingPath) => {
      // If eraser tool, remove intersecting annotations instead of adding
      if (drawing.tool === 'eraser') {
        updatePageAnnotations(pageNumber, (annotations) => {
          // Check which annotations intersect with eraser path
          const eraserBounds = {
            minX: Math.min(...drawing.points.map(p => p.x)),
            maxX: Math.max(...drawing.points.map(p => p.x)),
            minY: Math.min(...drawing.points.map(p => p.y)),
            maxY: Math.max(...drawing.points.map(p => p.y)),
          };
          
          const eraserRadius = drawing.width * 2;
          
          // Filter out drawings that intersect
          const newDrawings = annotations.drawings.filter(existingDrawing => {
            return !existingDrawing.points.some(point => 
              drawing.points.some(eraserPoint => {
                const distance = Math.sqrt(
                  Math.pow(point.x - eraserPoint.x, 2) + 
                  Math.pow(point.y - eraserPoint.y, 2)
                );
                return distance < eraserRadius;
              })
            );
          });
          
          // Filter out shapes that intersect
          const newShapes = annotations.shapes.filter(shape => {
            const shapeX = (shape.startPoint.x + shape.endPoint.x) / 2;
            const shapeY = (shape.startPoint.y + shape.endPoint.y) / 2;
            return !drawing.points.some(eraserPoint => {
              const distance = Math.sqrt(
                Math.pow(shapeX - eraserPoint.x, 2) + 
                Math.pow(shapeY - eraserPoint.y, 2)
              );
              return distance < eraserRadius * 3;
            });
          });
          
          // Filter out texts that intersect
          const newTexts = annotations.texts.filter(text => {
            return !drawing.points.some(eraserPoint => {
              const distance = Math.sqrt(
                Math.pow(text.position.x - eraserPoint.x, 2) + 
                Math.pow(text.position.y - eraserPoint.y, 2)
              );
              return distance < eraserRadius * 2;
            });
          });
          
          return {
            ...annotations,
            drawings: newDrawings,
            shapes: newShapes,
            texts: newTexts,
          };
        });
      } else {
        // Normal drawing
        updatePageAnnotations(pageNumber, (annotations) => ({
          ...annotations,
          drawings: [...annotations.drawings, drawing],
        }));
      }
    },
    [updatePageAnnotations]
  );

  const addText = useCallback(
    (pageNumber: number, text: TextAnnotation) => {
      updatePageAnnotations(pageNumber, (annotations) => ({
        ...annotations,
        texts: [...annotations.texts, text],
      }));
    },
    [updatePageAnnotations]
  );

  const updateText = useCallback(
    (pageNumber: number, textId: string, updates: Partial<TextAnnotation>) => {
      updatePageAnnotations(pageNumber, (annotations) => ({
        ...annotations,
        texts: annotations.texts.map((text) =>
          text.id === textId ? { ...text, ...updates } : text
        ),
      }));
    },
    [updatePageAnnotations]
  );

  const addShape = useCallback(
    (pageNumber: number, shape: ShapeAnnotation) => {
      updatePageAnnotations(pageNumber, (annotations) => ({
        ...annotations,
        shapes: [...annotations.shapes, shape],
      }));
    },
    [updatePageAnnotations]
  );

  const removeAnnotation = useCallback(
    (pageNumber: number, annotationId: string) => {
      updatePageAnnotations(pageNumber, (annotations) => ({
        ...annotations,
        drawings: annotations.drawings.filter((d) => d.id !== annotationId),
        texts: annotations.texts.filter((t) => t.id !== annotationId),
        shapes: annotations.shapes.filter((s) => s.id !== annotationId),
      }));
    },
    [updatePageAnnotations]
  );

  // Page operations
  const rotatePage = useCallback((pageNumber: number, degrees: number) => {
    setState((prev) => {
      const pageIndex = prev.pages.findIndex(
        (p) => p.pageNumber === pageNumber
      );
      if (pageIndex === -1) return prev;

      const newPages = [...prev.pages];
      newPages[pageIndex] = {
        ...newPages[pageIndex],
        rotation: (newPages[pageIndex].rotation + degrees) % 360,
      };

      return { ...prev, pages: newPages };
    });
  }, []);

  const deletePage = useCallback((pageNumber: number) => {
    setState((prev) => {
      if (prev.pages.length <= 1) {
        setError("Cannot delete the last page");
        return prev;
      }

      const newPages = prev.pages
        .filter((p) => p.pageNumber !== pageNumber)
        .map((p, index) => ({ ...p, pageNumber: index + 1 }));

      return {
        ...prev,
        pages: newPages,
        totalPages: newPages.length,
        currentPage: Math.min(prev.currentPage, newPages.length),
      };
    });
  }, []);

  const reorderPages = useCallback((fromIndex: number, toIndex: number) => {
    setState((prev) => {
      const newPages = [...prev.pages];
      const [movedPage] = newPages.splice(fromIndex, 1);
      newPages.splice(toIndex, 0, movedPage);

      // Update page numbers
      return {
        ...prev,
        pages: newPages.map((p, index) => ({ ...p, pageNumber: index + 1 })),
      };
    });
  }, []);

  const duplicatePage = useCallback((pageNumber: number) => {
    setState((prev) => {
      const pageIndex = prev.pages.findIndex(
        (p) => p.pageNumber === pageNumber
      );
      if (pageIndex === -1) return prev;

      const pageToDuplicate = prev.pages[pageIndex];
      const newPage: PDFPageData = {
        ...pageToDuplicate,
        pageNumber: pageNumber + 1,
        annotations: {
          ...pageToDuplicate.annotations,
          pageNumber: pageNumber + 1,
        },
      };

      const newPages = [
        ...prev.pages.slice(0, pageIndex + 1),
        newPage,
        ...prev.pages.slice(pageIndex + 1),
      ].map((p, index) => ({ ...p, pageNumber: index + 1 }));

      return {
        ...prev,
        pages: newPages,
        totalPages: newPages.length,
      };
    });
  }, []);

  // History operations
  const undo = useCallback((pageNumber: number) => {
    setState((prev) => {
      const pageHistory = prev.history[pageNumber];
      if (!pageHistory || pageHistory.past.length === 0) return prev;

      const previous = pageHistory.past[pageHistory.past.length - 1];
      const newPast = pageHistory.past.slice(0, pageHistory.past.length - 1);

      const pageIndex = prev.pages.findIndex(
        (p) => p.pageNumber === pageNumber
      );
      if (pageIndex === -1) return prev;

      const newPages = [...prev.pages];
      newPages[pageIndex] = {
        ...newPages[pageIndex],
        annotations: previous,
      };

      return {
        ...prev,
        pages: newPages,
        history: {
          ...prev.history,
          [pageNumber]: {
            past: newPast,
            present: previous,
            future: [pageHistory.present, ...pageHistory.future],
          },
        },
      };
    });
  }, []);

  const redo = useCallback((pageNumber: number) => {
    setState((prev) => {
      const pageHistory = prev.history[pageNumber];
      if (!pageHistory || pageHistory.future.length === 0) return prev;

      const next = pageHistory.future[0];
      const newFuture = pageHistory.future.slice(1);

      const pageIndex = prev.pages.findIndex(
        (p) => p.pageNumber === pageNumber
      );
      if (pageIndex === -1) return prev;

      const newPages = [...prev.pages];
      newPages[pageIndex] = {
        ...newPages[pageIndex],
        annotations: next,
      };

      return {
        ...prev,
        pages: newPages,
        history: {
          ...prev.history,
          [pageNumber]: {
            past: [...pageHistory.past, pageHistory.present],
            present: next,
            future: newFuture,
          },
        },
      };
    });
  }, []);

  const clearPageAnnotations = useCallback((pageNumber: number) => {
    updatePageAnnotations(pageNumber, (annotations) => ({
      ...annotations,
      drawings: [],
      texts: [],
      shapes: [],
    }));
  }, [updatePageAnnotations]);

  // Export functionality
  const exportPDF = useCallback(
    async (options: PDFExportOptions): Promise<Blob | null> => {
      try {
        const { PDFDocument } = await import("pdf-lib");

        if (options.format === "images") {
          // Export as images
          const pagesToExport = options.pages || state.pages.map((p) => p.pageNumber);
          const images = state.pages
            .filter((p) => pagesToExport.includes(p.pageNumber))
            .map((p) => p.dataUrl);

          // For simplicity, return the first image as blob
          // In production, you might want to zip them
          if (images.length > 0) {
            const response = await fetch(images[0]);
            return await response.blob();
          }
          return null;
        }

        // Export as PDF with annotations
        const pdfDoc = await PDFDocument.create();

        const pagesToExport = options.pages || state.pages.map((p) => p.pageNumber);

        for (const pageData of state.pages) {
          if (!pagesToExport.includes(pageData.pageNumber)) continue;

          // Convert dataUrl to image
          const response = await fetch(pageData.dataUrl);
          const imageBytes = await response.arrayBuffer();

          const image = await pdfDoc.embedPng(imageBytes);
          const page = pdfDoc.addPage([pageData.width, pageData.height]);

          page.drawImage(image, {
            x: 0,
            y: 0,
            width: pageData.width,
            height: pageData.height,
          });

          // TODO: Draw annotations on top if includeAnnotations is true
          // This would require converting canvas annotations to PDF format
        }

        const pdfBytes = await pdfDoc.save();
        return new Blob([pdfBytes as any], { type: "application/pdf" });
      } catch (err) {
        console.error("Export failed:", err);
        setError("Failed to export PDF");
        return null;
      }
    },
    [state.pages]
  );

  return {
    state,
    loadPDF,
    loadPDFFromUrl,
    addStreamedImage,
    setCurrentPage,
    setZoom,
    setTool,
    setCursorMode,
    setToolSettings,
    addDrawing,
    addText,
    addShape,
    updateText,
    removeAnnotation,
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
  };
};
