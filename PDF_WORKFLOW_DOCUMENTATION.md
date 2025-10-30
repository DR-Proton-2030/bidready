# PDF Annotation Workflow 🎨📄

## Overview

This document describes the new PDF annotation workflow integrated into the Create Blueprint page.

## User Flow

### 1. **Create Blueprint Page** (`/create-blueprint`)
```
┌─────────────────────────────────────────┐
│     Create Blueprint Form               │
│  • Name, Description, Status, etc.      │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│       File Upload Section               │
│  • Drop files or click to browse        │
│  • Supports images & PDFs               │
└─────────────────────────────────────────┘
              ↓
         File Selected?
              ↓
    ┌─────────┴──────────┐
    │                    │
   PDF                Images
    ↓                    ↓
Open PDF           Go to Image
Editor             Processing
(Same Page)        Page
    ↓
User Annotates
    ↓
Click "Next"
    ↓
Upload & Create
Blueprint
```

### 2. **PDF Upload Flow** ✨ (Corrected)
When user uploads a **PDF file**:

```typescript
// 1. File validation
if (file.type === "application/pdf") {
  // Only allow one PDF at a time
  if (filesArray.length > 1) {
    error: "Please upload only one PDF file at a time"
  }
}

// 2. Open PDF editor immediately (NO server upload yet)
setPdfFile(pdfFile);
setShowPdfEditor(true);

// 3. User edits/annotates the PDF
// ... drawing, text, shapes, rotate, etc ...

// 4. User clicks "Next - Create Blueprint"
// NOW we upload the annotated PDF

// 5. Create blueprint with annotated PDF
await handleNewBlueprint(formData with annotatedPdfBlob);

// 6. Redirect to blueprints list
router.push("/blueprints");
```

### 3. **PDF Editor View** (Same Page - Create Blueprint)
When PDF is selected, the page transforms into PDF editor:

```
┌──────────────────────────────────────────────────────────┐
│ Header: [Back to Form] | Blueprint Name                  │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │        PDF Annotation Editor (PDFHandler)          │  │
│  │                                                      │  │
│  │  Toolbar: [Pen][Text][Shapes][Colors]              │  │
│  │  ─────────────────────────────────────────────────  │  │
│  │  [Pages] │ PDF Canvas with Annotations             │  │
│  │   📄 P1  │                                         │  │
│  │   📄 P2  │   • Draw                               │  │
│  │   📄 P3  │   • Add text                           │  │
│  │          │   • Add shapes                         │  │
│  │          │   • Rotate pages                       │  │
│  │          │   • Delete/duplicate pages             │  │
│  │          │   • Undo/redo                          │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
│        [Next - Create Blueprint] ← Creates blueprint      │
└──────────────────────────────────────────────────────────┘
```

### 4. **Create Blueprint from PDF**
When user clicks "Next - Create Blueprint":

```typescript
// 1. Validate form data
if (!form.name || !form.description || !form.project_object_id) {
  error: "Name, description and project are required."
}

// 2. Export annotated PDF
const annotatedPdfBlob = await exportPDF(options);

// 3. Create FormData with blueprint info
const fd = new FormData();
fd.append("name", form.name);
fd.append("description", form.description);
fd.append("version", form.version);
fd.append("status", form.status);
fd.append("type", form.type);
fd.append("project_object_id", form.project_object_id);
fd.append("pdf_file", annotatedPdfBlob);
fd.append("page_count", pages.length);

// 4. Create blueprint
await handleNewBlueprint(fd);

// 5. Redirect to blueprints list
router.push("/blueprints");
```

### 5. **Image Upload Flow** (Unchanged)
When user uploads **image files**:
- Continues with existing flow
- Goes to `/blueprint-processing/[jobId]`
- AI detection and processing
- Returns to create page with processed images

## File Structure

### Modified Files
```
src/app/(dashboard)/create-blueprint/
└── page.tsx                       ← Main page with PDF editor integration
```

### New Components
```
src/components/pages/createBlueprint/
├── FileUploadSection.tsx         ← Modular upload component
└── ProcessedImagesSection.tsx    ← Modular images display
```

### Existing Components (Reused)
```
src/components/shared/pdf/
├── PDFHandler.tsx                ← PDF annotation component
├── PDFCanvasViewer.tsx           ← Canvas with drawing
├── PDFToolbar.tsx                ← Annotation tools
└── PageThumbnails.tsx            ← Page sidebar
```

## Key Features

### PDF Editor (Inline on Create Blueprint Page)
1. **Instant PDF loading** - No server upload, opens immediately
2. **Full annotation tools** - All PDFHandler features
3. **Back navigation** - Return to form without losing data
4. **Custom export** - "Next - Create Blueprint" button
5. **Validation** - Checks form data before creating blueprint

### Create Blueprint Page  
1. **Modular components** - Clean, reusable code
2. **Smart file handling** - PDF vs Image detection
3. **Single PDF restriction** - Only one PDF at a time
4. **Conditional rendering** - Shows form OR PDF editor
5. **State management** - PDF file stored in state until submission

## API Endpoints

### Create Blueprint (handles PDF)
```typescript
POST /api/blueprints (or your handleNewBlueprint endpoint)
Request: FormData {
  name: string,
  description: string,
  version: string,
  status: string,
  type: string,
  project_object_id: string,
  pdf_file: Blob,              // Annotated PDF
  page_count: string
}
Response: {
  success: true,
  message: string,
  data: { ... }
}
```

**Note:** The PDF is uploaded ONLY when user clicks "Next - Create Blueprint", not when they select the file.

## State Management

### Create Blueprint Page
```typescript
// Form state
const [form, setForm] = useState({
  name: "",
  description: "",
  version: "v1",
  status: "active",
  type: "",
  project_object_id: "",
});

// Upload state
const [isUploading, setIsUploading] = useState(false);

// Processed images (for image flow)
const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);

// PDF editor state
const [pdfFile, setPdfFile] = useState<File | null>(null);
const [showPdfEditor, setShowPdfEditor] = useState(false);
```

## Error Handling

### Upload Validation
```typescript
// Multiple PDFs
if (hasPDF && filesArray.length > 1) {
  setError("Please upload only one PDF file at a time");
  return;
}

// File type validation (client-side)
if (file.type !== "application/pdf") {
  setError("File must be a PDF");
  return;
}
```

### Form Validation (Before Creating Blueprint)
```typescript
// Check required fields before creating blueprint
if (!form.name || !form.description || !form.project_object_id) {
  setError("Name, description and project are required.");
  return;
}
```

## Testing Checklist

### PDF Upload Flow
- [ ] Upload single PDF → opens PDF editor on same page
- [ ] Upload multiple PDFs → shows error
- [ ] Upload images → continues with image flow
- [ ] Invalid file type → shows error

### PDF Editor (Inline)
- [ ] PDF loads instantly (no server call)
- [ ] All annotation tools work (pen, text, shapes, etc.)
- [ ] Can draw, add text, rotate pages
- [ ] "Back to Form" button works
- [ ] Form data is preserved when going back
- [ ] Error handling displays properly

### Create Blueprint from PDF
- [ ] Form validation works (requires name, description, project)
- [ ] "Next - Create Blueprint" exports annotated PDF
- [ ] Blueprint is created successfully
- [ ] Redirects to blueprints list
- [ ] Annotated PDF is uploaded to server

### Create Blueprint Page (Images)
- [ ] FileUploadSection component renders
- [ ] ProcessedImagesSection shows images
- [ ] Form submission works
- [ ] Clear images button works

## Advantages of This Approach

### ✅ No Extra Page Navigation
- PDF editor opens on the same page
- No URL changes or redirects
- Seamless user experience

### ✅ Instant Feedback
- PDF loads immediately when selected
- No waiting for server upload
- Faster annotation start

### ✅ Modular Code
- FileUploadSection is reusable
- ProcessedImagesSection is reusable
- PDFHandler is self-contained

### ✅ Better UX
- Full-screen PDF annotation
- Back to form without losing data
- Clear workflow: Select → Edit → Create

### ✅ Easy Maintenance
- Single page handles both flows
- Clear state management
- Simple conditional rendering

## Next Steps

1. **Test the complete flow**
   ```bash
   npm run dev
   ```

2. **Fill the form** on create blueprint page
   - Name, description, project (required)
   - Version, status, type (optional)

3. **Upload a PDF** file

4. **Edit and annotate** the PDF
   - Draw with pen/highlighter
   - Add text annotations
   - Add shapes (rectangles, circles, arrows)
   - Rotate, delete, or duplicate pages

5. **Click "Next - Create Blueprint"**
   - Validates form data
   - Exports annotated PDF
   - Creates blueprint
   - Redirects to blueprints list

## Backend Integration

Your `handleNewBlueprint` function should handle:

```typescript
// In your backend API
POST /api/blueprints
Request: FormData {
  name: string,
  description: string,
  version: string,
  status: string,
  type: string,
  project_object_id: string,
  pdf_file: File,              // The annotated PDF
  page_count: string
}
```

---

**✅ Correct Flow Implemented!** 🚀 

The PDF editor now opens **immediately** after file selection (no server upload). Users can edit the PDF, and **only when they click "Next"** does the annotated PDF get uploaded and the blueprint gets created.
