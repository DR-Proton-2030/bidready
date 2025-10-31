// PDF Annotation Types and Interfaces

export type AnnotationTool =
  | "select"
  | "pen"
  | "highlighter"
  | "eraser"
  | "text"
  | "rectangle"
  | "circle"
  | "arrow"
  | "line";

export type CursorMode = "pan" | "draw";

export interface Point {
  x: number;
  y: number;
}

export interface DrawingPath {
  id: string;
  tool: AnnotationTool;
  points: Point[];
  color: string;
  width: number;
  opacity?: number;
}

export interface TextAnnotation {
  id: string;
  text: string;
  position: Point;
  fontSize: number;
  color: string;
  fontFamily?: string;
}

export interface ShapeAnnotation {
  id: string;
  type: "rectangle" | "circle" | "arrow" | "line";
  startPoint: Point;
  endPoint: Point;
  color: string;
  width: number;
  fill?: boolean;
  fillColor?: string;
}

export interface PageAnnotation {
  pageNumber: number;
  drawings: DrawingPath[];
  texts: TextAnnotation[];
  shapes: ShapeAnnotation[];
}

export interface PDFPageData {
  pageNumber: number;
  dataUrl: string;
  rotation: number; // 0, 90, 180, 270
  annotations: PageAnnotation;
  thumbnailUrl?: string;
  imageId?: string;
  // If the page was edited on canvas, editedImage can hold a File/Blob for upload
  editedImage?: File | Blob;
  width: number;
  height: number;
}

export interface AnnotationHistory {
  past: PageAnnotation[];
  present: PageAnnotation;
  future: PageAnnotation[];
}

export interface ToolSettings {
  color: string;
  width: number;
  fontSize: number;
  opacity: number;
}

export interface PDFViewerState {
  currentPage: number;
  totalPages: number;
  zoom: number;
  pages: PDFPageData[];
  selectedTool: AnnotationTool;
  cursorMode: CursorMode;
  toolSettings: ToolSettings;
  history: Record<number, AnnotationHistory>; // history per page
  isDrawing: boolean;
  selectedAnnotationId: string | null;
}

export interface PDFExportOptions {
  includeAnnotations: boolean;
  format: "pdf" | "images";
  quality?: number;
  pages?: number[]; // specific pages to export, empty = all
}

export interface PDFHandlerProps {
  file: File | null;
  onPagesChange?: (pages: PDFPageData[]) => void;
  onError?: (error: string) => void;
  maxZoom?: number;
  minZoom?: number;
  defaultZoom?: number;
}

export interface UsePDFAnnotationReturn {
  state: PDFViewerState;
  loadPDF: (file: File) => Promise<void>;
  loadPDFFromUrl: (pdfUrl: string) => Promise<void>;
  addStreamedImage: (imageUrl: string, pageNumber: number, imageId?: string) => void;
  setCurrentPage: (page: number) => void;
  setZoom: (zoom: number) => void;
  setTool: (tool: AnnotationTool) => void;
  setCursorMode: (mode: CursorMode) => void;
  setToolSettings: (settings: Partial<ToolSettings>) => void;
  addDrawing: (pageNumber: number, drawing: DrawingPath) => void;
  addText: (pageNumber: number, text: TextAnnotation) => void;
  addShape: (pageNumber: number, shape: ShapeAnnotation) => void;
  updateText: (pageNumber: number, textId: string, updates: Partial<TextAnnotation>) => void;
  removeAnnotation: (pageNumber: number, annotationId: string) => void;
  rotatePage: (pageNumber: number, degrees: number) => void;
  deletePage: (pageNumber: number) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;
  duplicatePage: (pageNumber: number) => void;
  undo: (pageNumber: number) => void;
  redo: (pageNumber: number) => void;
  clearPageAnnotations: (pageNumber: number) => void;
  exportPDF: (options: PDFExportOptions) => Promise<Blob | null>;
  // Set edited image for a page (e.g., when canvas edits are saved)
  setEditedImage: (pageNumber: number, file: File | Blob) => void;
  isLoading: boolean;
  error: string | null;
  allPagesLoaded: boolean;
  loadedPagesCount: number;
}
