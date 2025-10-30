# Testing Your PDF Integration 🧪

## Quick Test Steps

### 1. Start the Development Server
```bash
cd /Users/anikdutta/Documents/proton/bidready/bidready-fe
npm run dev
```

### 2. Navigate to Blueprint Processing Page
```
http://localhost:3000/blueprint-processing/[jobId]/page
```
(Replace `[jobId]` with an actual job ID from your system)

### 3. Test PDF Upload
1. ✅ Look for "Upload PDF for Annotation" button in header (purple button)
2. ✅ Click the button
3. ✅ Select a PDF file
4. ✅ Page should automatically switch to PDF annotation mode

### 4. Test PDF Annotation Tools
1. ✅ **Toolbar appears** at top with 9 tools
2. ✅ **Click pen tool** - Draw on PDF
3. ✅ **Try highlighter** - Should be semi-transparent
4. ✅ **Add text** - Click text tool, click on PDF, type
5. ✅ **Draw shapes** - Try rectangle, circle, arrow
6. ✅ **Change colors** - Click different colors
7. ✅ **Adjust width** - Use width slider
8. ✅ **Undo/Redo** - Test history buttons

### 5. Test Page Management
1. ✅ **Navigate pages** - Use arrows or thumbnails
2. ✅ **Rotate page** - Click rotate button
3. ✅ **Zoom in/out** - Use zoom controls
4. ✅ **Drag thumbnail** - Reorder pages
5. ✅ **Duplicate page** - Click copy icon on thumbnail

### 6. Test Export
1. ✅ **Click Export** button
2. ✅ PDF should download automatically
3. ✅ Open downloaded PDF to verify annotations

### 7. Test Mode Switching
1. ✅ **Click "Back to Images"** - Should return to image mode
2. ✅ **View Mode Switcher appears** (when both PDF and images available)
3. ✅ **Toggle between modes** - Both should work

### 8. Test Image Mode (Still Works)
1. ✅ Images display correctly
2. ✅ AI detection still works
3. ✅ Grid/Fullscreen toggle works
4. ✅ Create Blueprint button works

## 🐛 Troubleshooting

### PDF Not Loading?
**Check:**
- File is actually a PDF (not renamed image)
- File size is reasonable (<50MB works best)
- Browser console for errors

**Fix:**
```bash
# Check if pdfjs-dist is installed
npm list pdfjs-dist

# If missing, reinstall
npm install pdfjs-dist@^2.16.105
```

### Drawing Not Working?
**Check:**
- Tool is selected (should be highlighted in blue)
- Not in "Select" mode (which is for panning)
- Canvas is loaded (wait for PDF to fully render)

**Fix:**
- Click a drawing tool explicitly (pen, highlighter, etc.)
- Refresh page and try again

### Mode Switching Not Working?
**Check:**
- ViewModeSwitcher component is visible
- State is updating (check React DevTools)

**Fix:**
```tsx
// Verify state in component
console.log("Current mode:", viewMode);
console.log("PDF file:", pdfFile);
```

### Export Not Downloading?
**Check:**
- Browser didn't block popup
- Sufficient disk space
- Annotations were actually added

**Fix:**
- Check browser's download settings
- Try a different browser
- Check console for errors

## 📊 Expected Console Output

### On Page Load:
```
Blueprint processing page loaded
Job ID: [your-job-id]
Processed images: [number]
```

### On PDF Upload:
```
PDF file selected: [filename]
Switching to PDF mode
PDF loaded successfully. Processing [N] pages...
```

### On Annotation:
```
Drawing added: drawing_[timestamp]
Shape added: shape_[timestamp]
Text added: text_[timestamp]
```

### On Export:
```
PDF exported: [filename]_annotated.pdf
PDF export saved: [filename]
```

## ✅ Success Criteria

Your integration is working if:
- [ ] PDF upload button appears
- [ ] PDF file picker opens
- [ ] PDF loads and displays
- [ ] All 9 annotation tools work
- [ ] Can draw, add text, add shapes
- [ ] Colors and widths change
- [ ] Zoom and pan work
- [ ] Page thumbnails appear
- [ ] Can navigate between pages
- [ ] Undo/Redo work
- [ ] Export downloads PDF
- [ ] Can switch back to image mode
- [ ] Image mode still fully functional
- [ ] No console errors
- [ ] No TypeScript errors

## 🎯 Test Checklist

### Core Features
- [ ] PDF upload
- [ ] PDF display
- [ ] Pen tool
- [ ] Highlighter
- [ ] Eraser
- [ ] Text tool
- [ ] Rectangle
- [ ] Circle
- [ ] Arrow
- [ ] Line
- [ ] Color picker
- [ ] Width slider
- [ ] Font size
- [ ] Zoom in/out
- [ ] Page navigation
- [ ] Rotate page
- [ ] Delete page
- [ ] Duplicate page
- [ ] Reorder pages
- [ ] Undo
- [ ] Redo
- [ ] Clear page
- [ ] Export PDF

### Integration Features
- [ ] Mode switcher appears
- [ ] Can switch to image mode
- [ ] Can switch back to PDF mode
- [ ] State preserved between switches
- [ ] Upload button in header
- [ ] Error handling works
- [ ] Loading states work

### Edge Cases
- [ ] Very large PDF (100+ pages)
- [ ] Corrupted PDF file
- [ ] Non-PDF file upload attempt
- [ ] Network disconnection
- [ ] Browser back button
- [ ] Browser refresh
- [ ] Multiple PDFs in sequence

## 📸 Visual Verification

### What You Should See:

#### 1. Header with Upload Button
```
┌─────────────────────────────────────────────────┐
│ Blueprint Name                                   │
│ Version: v1                    [Upload PDF]     │
└─────────────────────────────────────────────────┘
```

#### 2. View Mode Switcher
```
┌─────────────────────────────────────────────────┐
│ View Mode:  [Image Detection] [PDF Annotation] │
└─────────────────────────────────────────────────┘
```

#### 3. PDF Viewer
```
┌─────────────────────────────────────────────────┐
│ Tools: [Pen] [Text] [Shapes] ... | [Export]   │
├─────────────────────────────────────────────────┤
│ [Pages] │ [PDF with annotations]                │
│  📄 P1  │                                       │
│  📄 P2  │                                       │
│  📄 P3  │                                       │
└─────────────────────────────────────────────────┘
```

## 🎉 Success!

If all tests pass, you have successfully integrated a full-featured PDF annotation system into your blueprint processing workflow!

## 📞 Need Help?

If you encounter issues:

1. **Check Documentation**
   - `PDF_INTEGRATION_COMPLETE.md`
   - `PDF_HANDLER_DOCUMENTATION.md`
   - `QUICK_START_PDF.md`

2. **Check Console**
   - Browser DevTools Console tab
   - Look for error messages
   - Check network requests

3. **Check Types**
   - Run `npm run type-check` (if available)
   - Look for TypeScript errors

4. **Check Dependencies**
   ```bash
   npm list react-pdf fabric pdf-lib pdfjs-dist
   ```

## 🚀 Next Steps

Once testing is complete:
1. Commit your changes
2. Deploy to staging
3. User acceptance testing
4. Production deployment

Happy testing! 🎨📄
