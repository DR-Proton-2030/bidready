/**
 * Simple PDF to image converter using legacy PDF.js
 * This is a fallback implementation for testing
 */

interface SimplePDFResult {
  success: boolean;
  pageCount?: number;
  error?: string;
}

export const testPDFProcessing = async (
  file: File
): Promise<SimplePDFResult> => {
  try {
    if (typeof window === "undefined") {
      return { success: false, error: "Client-side only" };
    }

    console.log("Testing PDF processing for:", file.name);

    // Dynamic import to avoid SSR issues - use legacy version
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");

    // Set worker URL to legacy version
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    console.log("ArrayBuffer size:", arrayBuffer.byteLength);

    // Try to load the PDF
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      verbosity: 0,
    });

    const pdf = await loadingTask.promise;
    const pageCount = pdf.numPages;

    console.log("PDF loaded successfully. Pages:", pageCount);

    // Try to get the first page
    const firstPage = await pdf.getPage(1);
    const viewport = firstPage.getViewport({ scale: 1.0 });
    console.log(
      "First page loaded successfully. Dimensions:",
      viewport.width,
      "x",
      viewport.height
    );

    // Clean up
    pdf.destroy();

    return { success: true, pageCount };
  } catch (error) {
    console.error("PDF test failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
