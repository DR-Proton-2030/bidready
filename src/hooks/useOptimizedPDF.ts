"use client";
import { useState, useCallback, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFMetadata, PDFAnnotationData } from "@/@types/interface/pdfStorage.interface";
import {
  PageAnnotation,
  DrawingPath,
  TextAnnotation,
  ShapeAnnotation,
} from "@/@types/pdf/pdfAnnotation.interface";

// Set worker source
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;
}

interface UseOptimizedPDFReturn {
  pdfDoc: any; // PDFDocumentProxy
  metadata: PDFMetadata | null;
  currentPage: number;
  totalPages: number;
  zoom: number;
  annotations: { [pageNumber: number]: PageAnnotation };
  pageRotations: { [pageNumber: number]: number };
  isLoading: boolean;
  error: string | null;
  loadPDF: (file: File) => Promise<void>;
  setCurrentPage: (page: number) => void;
  setZoom: (zoom: number) => void;
  addAnnotation: (pageNumber: number, annotation: DrawingPath | TextAnnotation | ShapeAnnotation) => void;
  rotatePage: (pageNumber: number, degrees: number) => void;
  clearPageAnnotations: (pageNumber: number) => void;
  getAnnotationCount: (pageNumber: number) => number;
  exportPDFWithAnnotations: () => Promise<Blob | null>;
}

export const useOptimizedPDF = (): UseOptimizedPDFReturn => {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [metadata, setMetadata] = useState<PDFMetadata | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [annotations, setAnnotations] = useState<{ [pageNumber: number]: PageAnnotation }>({});
  const [pageRotations, setPageRotations] = useState<{ [pageNumber: number]: number }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const originalFileRef = useRef<File | null>(null);

  const loadPDF = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      // Keep reference to original file
      originalFileRef.current = file;

      // Load PDF document
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);

      // Set metadata
      setMetadata({
        fileName: file.name,
        fileSize: file.size,
        pageCount: pdf.numPages,
        lastModified: file.lastModified,
      });

      // Initialize annotations for all pages
      const initialAnnotations: { [key: number]: PageAnnotation } = {};
      for (let i = 1; i <= pdf.numPages; i++) {
        initialAnnotations[i] = {
          pageNumber: i,
          drawings: [],
          texts: [],
          shapes: [],
        };
      }
      setAnnotations(initialAnnotations);

      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load PDF";
      setError(errorMessage);
      setIsLoading(false);
      console.error("PDF loading error:", err);
    }
  }, []);

  const addAnnotation = useCallback(
    (pageNumber: number, annotation: DrawingPath | TextAnnotation | ShapeAnnotation) => {
      setAnnotations((prev) => {
        const pageAnnotations = prev[pageNumber] || {
          pageNumber,
          drawings: [],
          texts: [],
          shapes: [],
        };

        let updated = { ...pageAnnotations };

        // Determine annotation type and add to appropriate array
        if ('points' in annotation) {
          updated.drawings = [...updated.drawings, annotation as DrawingPath];
        } else if ('text' in annotation) {
          updated.texts = [...updated.texts, annotation as TextAnnotation];
        } else {
          updated.shapes = [...updated.shapes, annotation as ShapeAnnotation];
        }

        return {
          ...prev,
          [pageNumber]: updated,
        };
      });
    },
    []
  );

  const rotatePage = useCallback((pageNumber: number, degrees: number) => {
    setPageRotations((prev) => ({
      ...prev,
      [pageNumber]: ((prev[pageNumber] || 0) + degrees) % 360,
    }));
  }, []);

  const clearPageAnnotations = useCallback((pageNumber: number) => {
    setAnnotations((prev) => ({
      ...prev,
      [pageNumber]: {
        pageNumber,
        drawings: [],
        texts: [],
        shapes: [],
      },
    }));
  }, []);

  const getAnnotationCount = useCallback(
    (pageNumber: number): number => {
      const pageAnnotations = annotations[pageNumber];
      if (!pageAnnotations) return 0;

      return (
        pageAnnotations.drawings.length +
        pageAnnotations.texts.length +
        pageAnnotations.shapes.length
      );
    },
    [annotations]
  );

  const exportPDFWithAnnotations = useCallback(async (): Promise<Blob | null> => {
    if (!originalFileRef.current) {
      setError("No PDF file loaded");
      return null;
    }

    try {
      // For now, return the original PDF file
      // In the future, you can merge annotations using pdf-lib
      return originalFileRef.current;
    } catch (err) {
      console.error("Export failed:", err);
      setError("Failed to export PDF");
      return null;
    }
  }, []);

  return {
    pdfDoc,
    metadata,
    currentPage,
    totalPages,
    zoom,
    annotations,
    pageRotations,
    isLoading,
    error,
    loadPDF,
    setCurrentPage,
    setZoom,
    addAnnotation,
    rotatePage,
    clearPageAnnotations,
    getAnnotationCount,
    exportPDFWithAnnotations,
  };
};
