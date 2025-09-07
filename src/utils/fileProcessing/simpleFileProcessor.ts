// Simple file processor using stable PDF.js version
export interface ProcessedImage {
  id: string;
  name: string;
  dataUrl: string;
  pageNumber?: number;
  originalFile: File;
}

export interface FileProcessingResult {
  images: ProcessedImage[];
  totalPages?: number;
  fileType: "image" | "pdf";
}

/**
 * Process a file and convert it to an array of images
 * - For images: returns the image directly
 * - For PDFs: converts each page to an image
 */
export const processFile = async (
  file: File
): Promise<FileProcessingResult> => {
  // Ensure we're on the client side
  if (typeof window === "undefined") {
    throw new Error("File processing is only available on the client side");
  }

  const fileType = getFileType(file);

  if (fileType === "image") {
    return processImageFile(file);
  } else if (fileType === "pdf") {
    return processPdfFile(file);
  } else {
    throw new Error(
      "Unsupported file type. Please upload an image or PDF file."
    );
  }
};

/**
 * Determine file type based on MIME type and extension
 */
const getFileType = (file: File): "image" | "pdf" | "unknown" => {
  const imageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];
  const pdfTypes = ["application/pdf"];

  if (imageTypes.includes(file.type)) {
    return "image";
  } else if (pdfTypes.includes(file.type)) {
    return "pdf";
  } else {
    // Fallback to extension check
    const extension = file.name.toLowerCase().split(".").pop();
    if (
      ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || "")
    ) {
      return "image";
    } else if (extension === "pdf") {
      return "pdf";
    }
  }

  return "unknown";
};

/**
 * Process an image file
 */
const processImageFile = async (file: File): Promise<FileProcessingResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;

      resolve({
        images: [
          {
            id: generateId(),
            name: file.name,
            dataUrl,
            originalFile: file,
          },
        ],
        fileType: "image",
      });
    };

    reader.onerror = () => {
      reject(new Error("Failed to read image file"));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Process a PDF file and convert each page to an image using older PDF.js
 */
const processPdfFile = async (file: File): Promise<FileProcessingResult> => {
  try {
    console.log("Starting PDF processing for file:", file.name);

    // Dynamic import of PDF.js legacy version
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");

    // Set worker source to legacy version - this should work better
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

    console.log("PDF.js legacy loaded successfully");

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    console.log("File converted to ArrayBuffer");

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      verbosity: 0,
    });

    const pdf = await loadingTask.promise;
    const totalPages = pdf.numPages;
    const images: ProcessedImage[] = [];

    console.log(`PDF loaded successfully. Processing ${totalPages} pages...`);

    // Process each page
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      try {
        console.log(`Processing page ${pageNum}/${totalPages}`);

        const page = await pdf.getPage(pageNum);
        const scale = 1.5;
        const viewport = page.getViewport({ scale });

        // Create canvas
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Failed to get 2D context from canvas");
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render page to canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;

        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

        images.push({
          id: generateId(),
          name: `${file.name.replace(".pdf", "")}_page_${pageNum}`,
          dataUrl,
          pageNumber: pageNum,
          originalFile: file,
        });

        console.log(`Page ${pageNum} processed successfully`);
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError);
        // Continue with other pages
      }
    }

    if (images.length === 0) {
      throw new Error("No pages could be processed from the PDF");
    }

    console.log(`Successfully processed ${images.length} pages from PDF`);

    return {
      images,
      totalPages,
      fileType: "pdf",
    };
  } catch (error) {
    console.error("Error processing PDF:", error);

    if (error instanceof Error) {
      if (error.message.includes("Invalid PDF")) {
        throw new Error(
          "Invalid PDF file. Please ensure the file is not corrupted."
        );
      } else if (error.message.includes("password")) {
        throw new Error("Password-protected PDFs are not supported.");
      } else {
        throw new Error(`PDF processing failed: ${error.message}`);
      }
    }

    throw new Error("Failed to process PDF file. Please try again.");
  }
};

/**
 * Generate a unique ID for images
 */
const generateId = (): string => {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Convert processed images to a format suitable for FormData
 */
export const convertImagesToFormData = (
  images: ProcessedImage[]
): { blobs: Blob[]; names: string[] } => {
  const blobs: Blob[] = [];
  const names: string[] = [];

  images.forEach((image) => {
    // Convert data URL to blob
    const blob = dataUrlToBlob(image.dataUrl);
    blobs.push(blob);
    names.push(image.name);
  });

  return { blobs, names };
};

/**
 * Convert data URL to blob
 */
const dataUrlToBlob = (dataUrl: string): Blob => {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
};

/**
 * Validate file size and type
 */
export const validateFile = (
  file: File,
  maxSizeMB: number = 10
): { valid: boolean; error?: string } => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: "File appears to be empty" };
  }

  const fileType = getFileType(file);
  if (fileType === "unknown") {
    return {
      valid: false,
      error: "Please upload an image (JPEG, PNG, GIF, WebP, SVG) or PDF file",
    };
  }

  return { valid: true };
};
