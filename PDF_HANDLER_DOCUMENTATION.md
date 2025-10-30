// PDF Handler Example Usage

## Overview
The new PDF Handler provides Adobe-like PDF annotation capabilities including:
- Drawing tools (pen, highlighter, eraser)
- Shape tools (rectangle, circle, arrow, line)
- Text annotations
- Page management (delete, rotate, reorder, duplicate)
- Zoom and pan controls
- Undo/Redo functionality
- Export annotated PDFs

## Components Created

### 1. PDFHandler (Main Component)
Location: `src/components/shared/pdf/PDFHandler.tsx`

Main component that orchestrates all PDF annotation features.

```tsx
import PDFHandler from "@/components/shared/pdf/PDFHandler";

<PDFHandler
  file={pdfFile}
  onPagesChange={(exportData) => {
    // Handle exported PDF
    console.log(exportData.blob, exportData.fileName);
  }}
  onError={(error) => console.error(error)}
/>
```

### 2. usePDFAnnotation Hook
Location: `src/hooks/usePDFAnnotation.ts`

Core hook for managing PDF state and annotations.

```tsx
import { usePDFAnnotation } from "@/hooks/usePDFAnnotation";

const {
  state,
  loadPDF,
  setCurrentPage,
  setZoom,
  setTool,
  addDrawing,
  addText,
  addShape,
  rotatePage,
  deletePage,
  undo,
  redo,
  exportPDF,
  isLoading,
  error,
} = usePDFAnnotation();
```

### 3. Supporting Components

- **PDFCanvasViewer**: Canvas-based viewer with drawing overlay
- **PDFToolbar**: Toolbar with all annotation tools and controls
- **PageThumbnails**: Sidebar with page thumbnails for navigation

## Integration in VersionTypeFileRowClient

The component now supports two modes:

### Mode 1: Traditional (Convert PDF to Images)
```tsx
<VersionTypeFileRowClient
  version={version}
  type={type}
  onChange={handleChange}
  onFileChange={handleFileChange}
  onImagesProcessed={handleImagesProcessed}
  usePDFAnnotation={false}
/>
```

### Mode 2: PDF Annotation Mode (New)
```tsx
<VersionTypeFileRowClient
  version={version}
  type={type}
  onChange={handleChange}
  onFileChange={handleFileChange}
  onImagesProcessed={handleImagesProcessed}
  usePDFAnnotation={true}
/>
```

## Features

### Drawing Tools
- **Select**: Pan and select annotations
- **Pen**: Freehand drawing
- **Highlighter**: Semi-transparent highlighting
- **Eraser**: Remove drawings
- **Text**: Add text annotations
- **Shapes**: Rectangle, Circle, Arrow, Line

### Tool Settings
- Color picker with presets
- Line width adjustment
- Font size control
- Opacity settings

### Page Operations
- Navigate between pages
- Rotate pages (90° increments)
- Delete pages
- Duplicate pages
- Reorder pages (drag & drop in sidebar)
- Clear all annotations on a page

### View Controls
- Zoom in/out (50% - 300%)
- Pan canvas
- Page thumbnails for quick navigation

### History
- Undo/Redo per page
- Maintains annotation history

### Export
- Export as annotated PDF
- Export specific pages
- Include/exclude annotations

## Usage Example

```tsx
"use client";
import React, { useState } from "react";
import PDFHandler from "@/components/shared/pdf/PDFHandler";

export default function PDFEditorPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    }
  };

  const handleExport = (exportData: { blob: Blob; fileName: string }) => {
    // Download the annotated PDF
    const url = URL.createObjectURL(exportData.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportData.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PDF Editor</h1>
      
      {!pdfFile ? (
        <div className="mb-4">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>
      ) : null}

      <PDFHandler
        file={pdfFile}
        onPagesChange={handleExport}
        onError={(err) => console.error("PDF Error:", err)}
      />
    </div>
  );
}
```

## Type Definitions

All types are defined in `src/@types/pdf/pdfAnnotation.interface.ts`:

- `AnnotationTool`: Tool types
- `DrawingPath`: Drawing/pen annotations
- `TextAnnotation`: Text annotations
- `ShapeAnnotation`: Shape annotations
- `PDFPageData`: Page data with annotations
- `PDFViewerState`: Complete state
- `PDFExportOptions`: Export configuration

## Dependencies Installed

- `react-pdf`: PDF rendering
- `fabric`: Canvas-based drawing (not currently used, but available for advanced features)
- `pdf-lib`: PDF manipulation and export
- `pdfjs-dist`: PDF.js for rendering

## Notes

- The PDF worker is loaded from `/pdf.worker.min.js` (already in your public folder)
- All coordinates are normalized to canvas coordinates for zoom independence
- Annotations are stored per page with full history support
- The component is fully client-side ("use client" directive)
