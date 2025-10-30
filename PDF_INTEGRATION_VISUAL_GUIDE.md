# PDF Viewer Integration - Visual Overview

## 🎨 Component Hierarchy

```
BlueprintProcessingPage
│
├── Header
│   ├── Blueprint Name & Version
│   ├── Processing Status
│   └── PDFUploadButton 🆕
│
├── ViewModeSwitcher 🆕
│   ├── Image Detection Mode (default)
│   └── PDF Annotation Mode (when PDF uploaded)
│
├── Conditional Content (based on viewMode)
│   │
│   ├── [PDF Mode] PDFViewerSection 🆕
│   │   ├── Info Banner
│   │   ├── PDFHandler
│   │   │   ├── PDFToolbar
│   │   │   ├── PageThumbnails (sidebar)
│   │   │   └── PDFCanvasViewer
│   │   └── Status Footer
│   │
│   └── [Image Mode] Original Content
│       ├── Tab Navigation (Unprocessed/Detected)
│       ├── ImageGridSection 🆕 (if extracted)
│       │   ├── Controls Bar
│       │   ├── Fullscreen View
│       │   └── Grid View
│       └── FullScreenImageViewer
│
└── Action Buttons (Back to Upload, Create Blueprint)
```

## 🔄 User Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  Start: Blueprint Processing Page                           │
│  (Shows processed images from upload)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
          ┌─────────────────────┐
          │ User sees 2 options:│
          │ 1. Work with images │
          │ 2. Upload PDF       │
          └──────────┬──────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌────────────────┐      ┌──────────────────┐
│ IMAGE MODE     │      │ PDF MODE         │
│ (Default)      │      │ (After upload)   │
├────────────────┤      ├──────────────────┤
│ • View images  │      │ • View PDF       │
│ • Run AI detect│      │ • Annotate       │
│ • Grid/Full    │      │ • Draw shapes    │
│ • Create BP    │      │ • Add text       │
│                │      │ • Manage pages   │
│                │      │ • Export PDF     │
└────────┬───────┘      └────────┬─────────┘
         │                       │
         │  [Switch Mode]        │
         └───────────┬───────────┘
                     │
                     ▼
         ┌────────────────────┐
         │ Both modes         │
         │ work independently │
         │ & can be toggled   │
         └────────────────────┘
```

## 💻 State Management Flow

```
Component State:
┌──────────────────────────────────────┐
│ viewMode: "images" | "pdf"           │ ← Main mode toggle
│ pdfFile: File | null                 │ ← Uploaded PDF
│ pdfExportData: {...} | null          │ ← Exported PDF data
│                                      │
│ imageViewMode: "fullscreen" | "grid" │ ← Image display mode
│ selectedImageIndex: number           │ ← Current image
│ imageDetectionResults: Map          │ ← AI results
└──────────────────────────────────────┘

Actions:
┌──────────────────────────────────────┐
│ setPdfFile(file)                     │ → Uploads PDF
│ setViewMode("pdf")                   │ → Switches to PDF mode
│ setViewMode("images")                │ → Switches to image mode
│ setPdfExportData(data)               │ → Saves export
└──────────────────────────────────────┘
```

## 🎯 Integration Points

### 1. Header Integration
```
┌─────────────────────────────────────────────────────┐
│ Header                                               │
├──────────────────┬──────────────────────────────────┤
│ Blueprint Name   │  Status  |  📤 Upload PDF Button │
│ Version: v1      │  25/25   |                       │
└──────────────────┴──────────────────────────────────┘
```

### 2. Mode Switcher
```
┌────────────────────────────────────────────────┐
│ View Mode                                      │
├────────────────────────────────────────────────┤
│  [ 🖼️  Image Detection ]  [ 📄 PDF Annotation ] │
│       (Active)                  (Inactive)     │
└────────────────────────────────────────────────┘
```

### 3. Content Area (PDF Mode)
```
┌────────────────────────────────────────────────┐
│ ℹ️  PDF Annotation Tools Available            │
│ • Draw with pen, highlighter, and shapes      │
│ • Add text annotations and comments            │
│ • Rotate, delete, or reorder pages            │
│ • Export annotated PDF when finished          │
├────────────────────────────────────────────────┤
│                                                │
│  [PDF Toolbar with all annotation tools]      │
│                                                │
│  ┌────┬──────────────────────────────────┐    │
│  │📄  │                                  │    │
│  │ P1 │                                  │    │
│  │    │      PDF Canvas                  │    │
│  │📄  │      (with annotations)          │    │
│  │ P2 │                                  │    │
│  │    │                                  │    │
│  │📄  │                                  │    │
│  │ P3 │                                  │    │
│  └────┴──────────────────────────────────┘    │
│  Sidebar  Main Viewer                         │
│                                                │
│  [Status: 3 annotations | Export button]      │
└────────────────────────────────────────────────┘
```

### 4. Content Area (Image Mode)
```
┌────────────────────────────────────────────────┐
│  [ Unprocessed (12) ]  [ Detected (13) ]       │
├────────────────────────────────────────────────┤
│  Controls: [🔳 Grid View] [👁️ Detect]         │
├────────────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐            │
│  │ Image1 │ │ Image2 │ │ Image3 │            │
│  │  [×]   │ │  [×]   │ │  [×]   │            │
│  └────────┘ └────────┘ └────────┘            │
│  ┌────────┐ ┌────────┐ ┌────────┐            │
│  │ Image4 │ │ Image5 │ │ Image6 │            │
│  │  [×]   │ │  [×]   │ │  [×]   │            │
│  └────────┘ └────────┘ └────────┘            │
└────────────────────────────────────────────────┘
```

## 📊 Component Communication

```
Parent (page.tsx)
       │
       ├─ pdfFile ──────────────→ PDFViewerSection
       │                                │
       ├─ viewMode ─────────────→ ViewModeSwitcher
       │                                │
       ├─ images ───────────────→ ImageGridSection
       │                                │
       └─ callbacks ←───────────────────┘
          (onFileSelect, onModeChange, etc.)
```

## 🎭 Interaction Examples

### Example 1: Upload and Annotate PDF
```
User Action                          System Response
───────────────────────────────────────────────────────
1. Click "Upload PDF"           →    File picker opens
2. Select PDF file              →    PDF loads
3. Auto-switch to PDF mode      →    PDF viewer shown
4. Draw with pen tool           →    Drawing appears
5. Add text annotation          →    Text modal opens
6. Click "Export"               →    PDF downloads
```

### Example 2: Switch Between Modes
```
User Action                          System Response
───────────────────────────────────────────────────────
1. In image mode                →    Images displayed
2. Click "Upload PDF"           →    Switch to PDF mode
3. Annotate PDF                 →    Tools available
4. Click "Back to Images"       →    Return to images
5. Images still there           →    State preserved
6. Click PDF mode again         →    PDF still available
```

## 🔑 Key Features

### Modular Design ✅
- Each component has single responsibility
- Easy to maintain and extend
- Reusable across application

### State Management ✅
- Clean separation of concerns
- No prop drilling
- Easy to debug

### User Experience ✅
- Intuitive mode switching
- No data loss between modes
- Clear visual feedback

### Code Quality ✅
- TypeScript throughout
- No compilation errors
- Consistent naming

## 📈 Performance Considerations

- **PDF Loading**: Lazy loads on demand
- **Image Processing**: Independent of PDF mode
- **State Updates**: Minimal re-renders
- **Memory**: Modes don't interfere

## 🚀 Ready to Use!

All components are:
- ✅ Created and integrated
- ✅ Error-free
- ✅ TypeScript compliant
- ✅ Ready for testing

Start using: `npm run dev` and navigate to a blueprint processing page!
