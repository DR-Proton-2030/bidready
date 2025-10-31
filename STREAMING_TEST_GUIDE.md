# Streaming Blueprint Test Guide

## Expected Behavior

When you upload a PDF and click "Create Blueprint", here's what should happen:

### ✅ Correct Flow (Non-Blocking)

1. **Submit Form** → Shows loading spinner
2. **First Response Received** (within ~1 second)
   - Browser Network tab shows request is still "pending" 
   - Loading spinner disappears
   - PDF Handler appears immediately
   - Console logs: `🎯 First response received, showing PDF Handler`
   
3. **While Processing** (concurrent)
   - Progress bar shows at top: "Processing PDF Pages... X%"
   - Pages appear one by one as they're processed
   - Console logs: `📄 Adding page 1 of 68`, `📄 Adding page 2 of 68`, etc.
   - Network tab still shows "pending" (streaming in progress)
   - User can already scroll, zoom, and view loaded pages
   
4. **Processing Complete**
   - Network tab shows "200" status
   - Progress bar disappears
   - Console logs: `✅ Blueprint processing complete`
   - All pages are now available

### ❌ Wrong Flow (Blocking - What We Fixed)

1. Submit Form → Shows loading spinner
2. **Nothing happens for 30-60 seconds** ← BAD!
3. Network tab shows "pending" the entire time
4. Finally shows PDF Handler with all pages at once

## Testing Steps

### 1. Open Browser DevTools

```bash
# Open Chrome DevTools
Cmd + Option + J (Mac)
Ctrl + Shift + J (Windows/Linux)
```

Navigate to:
- **Console** tab (to see logs)
- **Network** tab (to see streaming request)

### 2. Upload PDF

1. Fill out the blueprint form
2. Upload a multi-page PDF (at least 10+ pages)
3. Click "Create Blueprint"
4. **Watch closely!**

### 3. What to Look For

#### Console Output (Expected)
```
📦 Sending PDF FormData: ...
📥 Streaming data: { message: "Blueprint created..." }
🎯 First response received, showing PDF Handler
📋 Blueprint ID: 690460461d2ce6889fa9f723
📄 PDF URL: https://...
📄 Adding page 1 of 68
📄 Adding page 2 of 68
📄 Adding page 3 of 68
💓 Heartbeat: Processing...
📄 Adding page 4 of 68
...
✅ Blueprint processing complete
✅ Stream completed
```

#### Network Tab (Expected)
```
POST /api/blueprints/create-blueprint
Status: (pending) → stays pending while streaming
Type: fetch
```

The request should:
- Start immediately
- Show "pending" status
- Stay open while processing
- Show "200" when complete

#### UI Behavior (Expected)
- Form disappears after ~1 second
- PDF Handler appears immediately
- Progress bar shows: "Processing PDF Pages... 5%" (updates live)
- Thumbnail sidebar shows pages as they load
- Main viewer shows first page once loaded

## Debug Commands

### Check if Stream is Blocked

```javascript
// In browser console, before submitting:
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  console.log('🔵 Fetch called:', args[0]);
  const response = await originalFetch(...args);
  console.log('🟢 Response received:', response.status);
  return response;
};
```

### Monitor State Changes

Add to CreateBluePrint component temporarily:

```typescript
useEffect(() => {
  console.log('📊 State changed:', {
    showPdfHandler,
    isStreaming,
    streamingProgress,
    pagesLoaded: pdfState.pages.length,
    totalPages: pdfState.totalPages
  });
}, [showPdfHandler, isStreaming, streamingProgress, pdfState.pages.length]);
```

## Common Issues

### Issue 1: Nothing Happens for Long Time

**Symptom**: Form stays visible, loading spinner shows for 30+ seconds

**Cause**: Stream processing is blocking (await in wrong place)

**Fix**: Ensure `processStream()` is called without await:
```typescript
// ✅ Correct
processStream();
setError("");

// ❌ Wrong
await processStream();
setError("");
```

### Issue 2: PDF Handler Shows But No Pages Load

**Symptom**: PDF Handler appears but pages never populate

**Cause**: `addStreamedImage` not being called or images not in correct format

**Check**:
1. Console logs show `📄 Adding page X` messages?
2. Network tab shows image URLs being loaded?
3. `pdfState.pages.length` is increasing?

### Issue 3: CORS Error Loading PDF from URL

**Symptom**: Console shows CORS error when loading PDF

**Cause**: PDF URL is from S3 without proper CORS headers

**Fix**: Backend must set CORS headers on S3 or proxy the PDF

### Issue 4: Stream Never Completes

**Symptom**: Network tab stuck on "pending" forever, no complete message

**Cause**: Backend not sending final "complete" message or connection dropped

**Check**:
1. Backend logs show all pages processed?
2. Backend sends `{ type: "complete" }` at the end?
3. Connection timeout on server?

## Performance Metrics

### Expected Timings (68 page PDF)

| Event | Time | Notes |
|-------|------|-------|
| Submit to First Response | < 2s | Backend creates blueprint |
| First Response to PDF Handler | < 0.1s | Frontend renders UI |
| Each Page Processing | ~1-2s | Backend converts & uploads |
| Total Processing | 60-120s | Depends on page count |
| First Page Viewable | < 3s | User can start viewing |

### Key Point

**User should see PDF Handler within 2-3 seconds, not 60+ seconds!**

## Success Criteria

✅ PDF Handler appears within 3 seconds  
✅ Progress bar shows and updates live  
✅ Pages appear progressively (not all at once)  
✅ Network tab shows streaming (pending status)  
✅ Console logs show streaming data  
✅ User can interact with loaded pages while others are processing  
✅ No blocking or freezing  

## Example Session Recording

Record your test session and verify:

1. **T+0s**: Click "Create Blueprint"
2. **T+1s**: See loading spinner
3. **T+2s**: PDF Handler appears, progress bar shows "0%"
4. **T+3s**: First page appears, progress bar shows "1%"
5. **T+5s**: 3-4 pages visible, progress bar shows "5%"
6. **T+30s**: 25 pages visible, progress bar shows "37%"
7. **T+60s**: All pages loaded, progress bar disappears

If your timing matches this pattern, **streaming is working correctly!**

If your timing looks like:
- T+60s: Suddenly everything appears at once → **Streaming is blocked!**
