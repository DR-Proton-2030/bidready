import { ProcessedImage, BlueprintFormData } from "@/@types/interface/blueprint.interface";

/**
 * Validates the blueprint form data
 */
export const validateBlueprintForm = (form: BlueprintFormData, processedImages: ProcessedImage[]): string | null => {
  if (!form.name || !form.description || !form.project_object_id) {
    return "Name, description and project are required.";
  }

  if (processedImages.length === 0) {
    return "Please upload and process at least one image or PDF file.";
  }

  return null;
};

/**
 * Validates the PDF blueprint form data
 */
export const validatePdfBlueprintForm = (form: BlueprintFormData): string | null => {
  if (!form.name || !form.description || !form.project_object_id) {
    return "Name, description and project are required.";
  }

  return null;
};

/**
 * Creates image pairs with SVG overlays for blueprint submission
 */
export const createImagePairs = async (
  processedImages: ProcessedImage[],
  svgOverlays: Map<string, string | null>
) => {
  return await Promise.all(
    processedImages.map(async (image, index) => {
      // Fetch the image file from the server
      const imageResponse = await fetch(image.path);
      const imageBlob = await imageResponse.blob();
      const imageFile = new File([imageBlob], image.name, { type: imageBlob.type });
      
      // Get SVG overlay for this image (null if no detection/annotation was done)
      const svgOverlay = svgOverlays.get(image.id) || image.svgOverlay || null;
      
      return {
        image: imageFile,
        svg_overlay: svgOverlay,
        imageId: image.id,
        imageName: image.name,
        pageNumber: image.pageNumber
      };
    })
  );
};

/**
 * Builds FormData for blueprint creation with images
 */
export const buildBlueprintFormData = async (
  form: BlueprintFormData,
  processedImages: ProcessedImage[],
  svgOverlays: Map<string, string | null>
): Promise<FormData> => {
  const fd = new FormData();
  fd.append("name", form.name);
  fd.append("description", form.description);
  fd.append("version", form.version || "v1");
  fd.append("status", form.status);
  fd.append("type", form.type || "");
  fd.append("project_object_id", form.project_object_id);

  const imagePairs = await createImagePairs(processedImages, svgOverlays);

  // Add image files to FormData
  imagePairs.forEach((pair, index) => {
    fd.append(`image_${index}`, pair.image);
    if (pair.svg_overlay) {
      fd.append(`svg_overlay_${index}`, pair.svg_overlay);
    }
  });

  // Add image_pairs metadata
  const imagePairsMetadata = imagePairs.map((pair, index) => ({
    imageIndex: index,
    imageId: pair.imageId,
    imageName: pair.imageName,
    pageNumber: pair.pageNumber,
    hasSvgOverlay: !!pair.svg_overlay
  }));
  
  fd.append("image_pairs", JSON.stringify(imagePairsMetadata));
  fd.append("blueprint_files_count", String(processedImages.length));

  return fd;
};

/**
 * Builds FormData for PDF blueprint creation
 */
export const buildPdfBlueprintFormData = (
  form: BlueprintFormData,
  annotatedPdfBlob: Blob,
  pdfFileName: string,
  pageCount: number
): FormData => {
  const fd = new FormData();
  fd.append("name", form.name);
  fd.append("description", form.description);
  fd.append("version", form.version || "v1");
  fd.append("status", form.status);
  fd.append("type", form.type || "floor_plan");
  fd.append("project_object_id", form.project_object_id);
  
  // Add the annotated PDF file
  const annotatedFile = new File(
    [annotatedPdfBlob],
    pdfFileName.replace(".pdf", "_annotated.pdf") || "blueprint_annotated.pdf",
    { type: "application/pdf" }
  );
  fd.append("pdf_file", annotatedFile);
  fd.append("page_count", String(pageCount));

  return fd;
};

/**
 * Builds form parameters for URL
 */
export const buildFormParams = (form: BlueprintFormData): URLSearchParams => {
  return new URLSearchParams({
    name: form.name || 'Untitled Blueprint',
    description: form.description || 'Blueprint from uploaded files',
    version: form.version || 'v1',
    status: form.status || 'active',
    type: form.type || 'floor_plan',
    project_object_id: form.project_object_id || ''
  });
};
