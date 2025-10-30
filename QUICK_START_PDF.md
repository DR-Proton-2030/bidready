# Quick Start Guide - PDF Annotation Handler

## 🚀 Get Started in 3 Steps

### Step 1: Run the Demo
```bash
npm run dev
```

Then visit: **http://localhost:3000/pdf-demo**

### Step 2: Upload a PDF
- Click the upload area or drag & drop a PDF file
- The PDF will load with full annotation capabilities

### Step 3: Start Annotating!
- Select a tool from the toolbar
- Draw, write, highlight on your PDF
- Use page thumbnails to navigate
- Export when done!

---

## 📖 Using in Your Existing Components

### For Blueprint Upload (Recommended)

In your parent component:

```tsx
import VersionTypeFileRowClient from "@/components/pages/createBlueprint/VersionTypeFileRowClient";

<VersionTypeFileRowClient
  version={version}
  type={type}
  onChange={handleChange}
  onFileChange={handleFileChange}
  onImagesProcessed={(images) => {
    // images will contain the annotated PDF blob
    console.log("Processed:", images);
  }}
  usePDFAnnotation={true} // 👈 Enable PDF annotation mode
/>
```

### Standalone Usage

```tsx
import PDFHandler from "@/components/shared/pdf/PDFHandler";

function MyComponent() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <PDFHandler
      file={file}
      onPagesChange={(data) => {
        // Download or save the annotated PDF
        const url = URL.createObjectURL(data.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.fileName;
        a.click();
      }}
      onError={(err) => console.error(err)}
    />
  );
}
```

---

## 🎨 Tool Guide

### Toolbar (Top)

| Button | Function |
|--------|----------|
| 👆 Select | Pan and navigate |
| ✏️ Pen | Freehand drawing |
| 🖍️ Highlighter | Highlight text |
| 🧹 Eraser | Remove drawings |
| 📝 Text | Add text |
| ▭ Rectangle | Draw box |
| ⭕ Circle | Draw circle |
| ➡️ Arrow | Draw arrow |
| ➖ Line | Draw line |
| ↶ Undo | Undo last action |
| ↷ Redo | Redo action |
| ← → | Navigate pages |
| + - | Zoom controls |
| 🔄 | Rotate page |
| 🗑️ | Delete page |
| 💾 Export | Save PDF |

### Settings Bar (Bottom of Toolbar)

- **Color Palette**: Click any color or use custom color picker
- **Width Slider**: Adjust pen/line width (1-20px)
- **Font Size**: Adjust text size (8-72px)

### Sidebar (Left)

- **Page Thumbnails**: Click to navigate
- **Drag & Drop**: Reorder pages
- **Copy Button**: Duplicate page
- **Delete Button**: Remove page
- **Badge**: Shows annotation count

---

## ⌨️ Keyboard Shortcuts (Coming Soon)

These can be easily added:

- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Y`: Redo
- `Ctrl/Cmd + S`: Export
- `←` / `→`: Previous/Next page
- `+` / `-`: Zoom in/out

---

## 🎯 Common Use Cases

### 1. Marking Up Construction Blueprints
```tsx
// Enable annotation mode for blueprints
<VersionTypeFileRowClient usePDFAnnotation={true} ... />
```

### 2. Adding Notes to Documents
- Use Text tool
- Use Highlighter for important sections
- Use Pen for signatures or sketches

### 3. Editing Page Order
- Drag pages in the sidebar
- Delete unwanted pages
- Duplicate important pages

### 4. Collaborating on Designs
- Annotate PDFs with feedback
- Export and share annotated version
- Use arrows and shapes to point out areas

---

## 🛠️ Configuration

### Change Default Colors

Edit `src/components/shared/pdf/PDFToolbar.tsx`:

```tsx
const colors = [
  "#000000", // Black
  "#FF0000", // Red  
  "#00FF00", // Green
  // Add your custom colors here
];
```

### Adjust Zoom Limits

When using the hook directly:

```tsx
const pdfHook = usePDFAnnotation(
  5,    // maxZoom (500%)
  0.25, // minZoom (25%)
  1     // defaultZoom (100%)
);
```

### Change Export Quality

In `usePDFAnnotation.ts`, modify the canvas scale in `loadPDF`:

```tsx
const viewport = page.getViewport({ scale: 2 }); // Higher = better quality
```

---

## 🔧 Troubleshooting

### PDF Not Loading
- Check console for errors
- Ensure file is a valid PDF
- Check file size (default limit: 10MB)

### Drawing Not Working
- Make sure you selected a drawing tool (not Select)
- Check if you're in pan mode vs draw mode

### Export Not Working
- Check browser console for errors
- Ensure pdf-lib is installed: `npm install pdf-lib`

### Slow Performance
- Large PDFs render slowly
- Consider reducing scale in loadPDF
- Limit pages processed at once

---

## 📞 Support

For issues or questions:
1. Check `PDF_ANNOTATION_SUMMARY.md` for overview
2. Check `PDF_HANDLER_DOCUMENTATION.md` for API details
3. Review type definitions in `src/@types/pdf/pdfAnnotation.interface.ts`

---

## 🎉 You're Ready!

Start the demo and try it out:
```bash
npm run dev
```

Visit: **http://localhost:3000/pdf-demo**

Happy annotating! 🚀
