/**
 * PDF.js global configuration
 * This file sets up the PDF.js worker configuration to avoid "No GlobalWorkerOptions.workerSrc specified" errors
 */

let isConfigured = false;

/**
 * Initialize PDF.js worker configuration
 * Call this before using any PDF processing functionality
 */
export const configurePdfWorker = async () => {
  if (isConfigured) {
    return;
  }

  if (typeof window === "undefined") {
    // Only configure on client side
    return;
  }

  try {
    // Import PDF.js legacy version (matches package.json version 2.16.105)
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");

    // Set worker source to CDN (reliable fallback)
    // This matches the version installed in package.json
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

    isConfigured = true;
    console.log("PDF.js worker configured successfully");
  } catch (error) {
    console.error("Failed to configure PDF.js worker:", error);
  }
};

/**
 * Hook to use in components that need PDF processing
 */
export const usePdfWorkerConfig = () => {
  if (typeof window !== "undefined" && !isConfigured) {
    configurePdfWorker();
  }
};
