# Streaming Blueprint Integration

This document explains the implementation of the streaming blueprint creation flow with PDF handling.

## Overview

The system now supports **streaming PDF blueprint creation**, where:
1. User uploads a PDF file
2. Backend creates the blueprint and starts processing the PDF
3. Frontend receives real-time streaming updates as each page is processed
4. PDF Handler displays the pages as they're loaded from the stream
5. User can annotate the PDF immediately while processing continues

## Implementation Details

### 1. Backend Streaming Response (Expected Format)

The backend sends newline-delimited JSON responses in the following sequence:

#### Initial Response
```json
{
  "message": "Blueprint created, processing images...",
  "blueprint_id": "690460461d2ce6889fa9f723",
  "status": "processing",
  "file_url": "https://example.com/blueprint.pdf"
}
```

#### Image Processing Updates (One per page)
```json
{
  "type": "image_processed",
  "page": 1,
  "total_pages": 68,
  "image_url": "https://example.com/page_1.jpg",
  "image_id": "690460681d2ce6889fa9f725",
  "progress": 1
}
```

#### Completion Response
```json
{
  "type": "complete",
  "message": "Blueprint created successfully",
  "data": {
    "blueprint": { /* blueprint object */ },
    "total_images": 68,
    "image_urls": ["..."]
  }
}
```

#### Error Response
```json
{
  "type": "error",
  "message": "Failed to process PDF",
  "error": "Error details..."
}
```

### 2. Frontend Changes

#### A. usePDFAnnotation Hook (`src/hooks/usePDFAnnotation.ts`)

**New Methods Added:**

1. **`loadPDFFromUrl(pdfUrl: string)`**
   - Loads PDF metadata from a URL (no page rendering)
   - Sets total pages count
   - Used when backend provides the PDF URL

2. **`addStreamedImage(imageUrl: string, pageNumber: number)`**
   - Adds processed images to the PDF state
   - Called for each streamed image from backend
   - Automatically sorts pages and updates totals

**Updated Interface:**
```typescript
export interface UsePDFAnnotationReturn {
  // ... existing methods
  loadPDFFromUrl: (pdfUrl: string) => Promise<void>;
  addStreamedImage: (imageUrl: string, pageNumber: number) => void;
  // ... rest of methods
}
```

#### B. CreateBluePrint Component (`src/components/pages/createBlueprint/CreateBluePrint.tsx`)

**New State Variables:**
```typescript
const [isStreaming, setIsStreaming] = useState(false);
const [streamingProgress, setStreamingProgress] = useState(0);
const [showPdfHandler, setShowPdfHandler] = useState(false);
const [blueprintId, setBlueprintId] = useState<string>("");
const [pdfUrl, setPdfUrl] = useState<string>("");
const pdfAnnotationHook = usePDFAnnotation();
```

**Updated `handleSubmit` Function:**

The submit handler now:
1. Sends PDF file to `/api/blueprints/create-blueprint`
2. Reads streaming response line by line
3. Parses each JSON object
4. Updates UI based on response type:
   - **Initial response**: Loads PDF from URL, shows PDF Handler
   - **Image processed**: Adds image to PDF state, updates progress
   - **Complete**: Marks streaming as complete
   - **Error**: Displays error message

**Streaming Response Handler:**
```typescript
const reader = res.body?.getReader();
const decoder = new TextDecoder();
let buffer = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split("\n");
  buffer = lines.pop() || "";

  for (const line of lines) {
    const data = JSON.parse(line);
    
    if (data.message === "Blueprint created, processing images...") {
      // Load PDF and show handler
      await loadPDFFromUrl(data.file_url);
      setShowPdfHandler(true);
    } else if (data.type === "image_processed") {
      // Add processed image
      addStreamedImage(data.image_url, data.page);
      setStreamingProgress(data.progress);
    }
    // ... handle other types
  }
}
```

**New UI Section:**

When `showPdfHandler` is true, the component renders:
- Progress bar showing processing status
- PDF Handler with streaming images
- Back button to return to upload

#### C. PDFHandler Component (`src/components/shared/pdf/PDFHandler.tsx`)

**New Prop:**
```typescript
interface PDFHandlerProps {
  // ... existing props
  externalPDFHook?: ReturnType<typeof usePDFAnnotation>; // NEW
}
```

**Updated Logic:**
- Can now accept an external PDF annotation hook
- Uses external hook if provided, otherwise creates internal one
- Skips file loading if using external hook (already loaded via streaming)

#### D. PDFViewerSection Component (`src/components/pages/blueprintProcessing/PDFViewerSection.tsx`)

**New Prop:**
```typescript
interface PDFViewerSectionProps {
  // ... existing props
  externalPDFHook?: any; // NEW
}
```

Passes the external hook to PDFHandler.

### 3. User Flow

1. **Upload PDF**
   - User fills blueprint form
   - Uploads a PDF file
   - Clicks "Create Blueprint"

2. **Streaming Starts**
   - Form is submitted
   - Backend starts processing
   - First response received with blueprint ID and PDF URL

3. **PDF Handler Opens**
   - PDF Handler is displayed immediately
   - PDF metadata is loaded from URL
   - Progress bar appears at top

4. **Pages Stream In**
   - As backend processes each page, frontend receives image URL
   - Each image is added to PDF state
   - Progress bar updates (e.g., "Processing: 45/68 pages")
   - User can start viewing/annotating already-loaded pages

5. **Processing Complete**
   - Final "complete" message received
   - Progress bar disappears
   - All pages available for annotation

6. **Export**
   - User can annotate as desired
   - Click "Export" to save annotated PDF
   - Navigate to plans page

### 4. Benefits

✅ **Immediate Feedback**: User sees PDF Handler right away  
✅ **Progressive Loading**: Pages appear as they're ready  
✅ **Better UX**: No waiting for entire PDF to process  
✅ **Real-time Progress**: User knows exactly what's happening  
✅ **Early Interaction**: Can start annotating while processing continues  

### 5. Error Handling

- **Network errors**: Caught and displayed to user
- **Parse errors**: Logged, don't crash the stream
- **Processing errors**: Backend sends error type, displayed to user
- **Timeout protection**: Heartbeat messages keep connection alive

### 6. API Route

The frontend connects to: `/api/blueprints/create-blueprint`

This route is a Next.js API route that proxies to the backend.

**Expected Backend Endpoint:**
```
POST /blueprints/create-blueprint
Content-Type: multipart/form-data

Fields:
- name: string
- description: string
- version: string
- status: string
- type: string
- project_object_id: string
- blueprint_file: File
```

**Response:**
- Content-Type: application/json
- Transfer-Encoding: chunked
- Newline-delimited JSON objects

## Testing

To test the streaming integration:

1. Upload a multi-page PDF
2. Watch the progress bar
3. Observe pages loading incrementally
4. Verify you can interact with loaded pages while others are still loading
5. Check browser console for streaming logs

## Future Enhancements

- Add retry logic for failed page processing
- Support cancelling streaming
- Cache processed images locally
- Add WebSocket support for better streaming performance
