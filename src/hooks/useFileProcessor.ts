import { useState, useCallback, useEffect } from "react";
import {
  processFile,
  validateFile,
  ProcessedImage,
  FileProcessingResult,
  convertImagesToFormData,
} from "@/utils/fileProcessing";
import { testPDFProcessing } from "@/utils/fileProcessing/testPDF";

export interface UseFileProcessorState {
  processedImages: ProcessedImage[];
  isProcessing: boolean;
  error: string | null;
  originalFile: File | null;
  fileType: "image" | "pdf" | null;
  totalPages?: number;
}

export interface UseFileProcessorReturn extends UseFileProcessorState {
  processNewFile: (
    file: File
  ) => Promise<{
    images: ProcessedImage[];
    blobs: Blob[];
    names: string[];
  } | null>;
  removeImage: (imageId: string) => void;
  clearAll: () => void;
  getFormDataForImages: () => { blobs: Blob[]; names: string[] };
  previewImages: ProcessedImage[];
}

export const useFileProcessor = (
  maxFileSizeMB: number = 10
): UseFileProcessorReturn => {
  const [state, setState] = useState<UseFileProcessorState>({
    processedImages: [],
    isProcessing: false,
    error: null,
    originalFile: null,
    fileType: null,
    totalPages: undefined,
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const processNewFile = useCallback(
    async (file: File) => {
      if (!isClient) {
        setState((prev) => ({
          ...prev,
          error: "File processing is only available on the client side",
        }));
        return null;
      }
      // Reset state and start processing
      setState((prev) => ({
        ...prev,
        isProcessing: true,
        error: null,
        processedImages: [],
        originalFile: file,
      }));

      try {
        // Validate file
        const validation = validateFile(file, maxFileSizeMB);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        // For PDF files, test the processing first
        if (file.type === "application/pdf") {
          console.log("PDF file detected, running preliminary test...");
          const testResult = await testPDFProcessing(file);
          if (!testResult.success) {
            throw new Error(`PDF validation failed: ${testResult.error}`);
          }
          console.log(
            `PDF test passed. ${testResult.pageCount} pages detected.`
          );
        }

        // Process file
        const result: FileProcessingResult = await processFile(file);

        // Update state with the processed images
        setState((prev) => ({
          ...prev,
          processedImages: result.images,
          fileType: result.fileType,
          totalPages: result.totalPages,
          isProcessing: false,
          error: null,
        }));

        // Convert images to blobs/names so caller can use them immediately
        const { blobs, names } = convertImagesToFormData(result.images);
        return { images: result.images, blobs, names };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to process file";
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          error: errorMessage,
          processedImages: [],
          fileType: null,
          totalPages: undefined,
        }));
        return null;
      }
    },
    [maxFileSizeMB, isClient]
  );

  const removeImage = useCallback((imageId: string) => {
    setState((prev) => ({
      ...prev,
      processedImages: prev.processedImages.filter((img) => img.id !== imageId),
    }));
  }, []);

  const clearAll = useCallback(() => {
    setState({
      processedImages: [],
      isProcessing: false,
      error: null,
      originalFile: null,
      fileType: null,
      totalPages: undefined,
    });
  }, []);

  const getFormDataForImages = useCallback(() => {
    return convertImagesToFormData(state.processedImages);
  }, [state.processedImages]);

  return {
    ...state,
    processNewFile,
    removeImage,
    clearAll,
    getFormDataForImages,
    previewImages: state.processedImages,
  };
};
