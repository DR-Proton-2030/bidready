# Client-Side Streaming Fix

## Problem Identified

The streaming was being blocked by the Next.js API route middleware which was buffering the entire response before forwarding it to the client.

### Previous Flow (Buffered)

```
Client → Next.js API Route → Backend API
         ↓
         Buffers entire response (60+ seconds)
         ↓
Client ← All data at once
```

**Issue in `/api/blueprints/create-blueprint/route.ts`:**
```typescript
const body = await res.arrayBuffer(); // ← BUFFERS EVERYTHING!
return new Response(body, { ... });
```

This line waits for the entire stream to complete, converts it to an ArrayBuffer, then sends it all at once.

## Solution: Direct Backend Call

Instead of proxying through Next.js API route, we now call the backend API **directly from the client**.

### New Flow (Streaming)

```
Client → Backend API (Direct)
   ↓
   Receives chunks immediately as they arrive
   ↓
   UI updates in real-time
```

## Code Changes

### Before (Using Next.js Proxy)

```typescript
const res = await fetch("/api/blueprints/create-blueprint", {
  method: "POST",
  body: fd,
  credentials: "include",
});
// Response is buffered by Next.js route
```

### After (Direct Backend Call)

```typescript
const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8989';
const token = localStorage.getItem("@token");

const res = await fetch(`${BACKEND_URL}/blueprints/create-blueprint`, {
  method: "POST",
  body: fd,
  credentials: "include",
  headers: {
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  },
});

// Response streams directly to client
const reader = res.body.getReader();
// Process chunks as they arrive...
```

## Key Changes

### 1. Direct Backend URL

```typescript
// Get backend URL from environment
const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL || 
                   process.env.NEXT_PUBLIC_BLUEPRINTS_API_URL || 
                   'http://localhost:8989';

// Call directly
fetch(`${BACKEND_URL}/blueprints/create-blueprint`, { ... })
```

### 2. Manual Authorization Header

Since we're bypassing the Next.js API route, we need to manually add the auth token:

```typescript
const token = localStorage.getItem("@token");
const headers: Record<string, string> = {};

if (token) {
  headers["Authorization"] = `Bearer ${token}`;
}
```

### 3. Enhanced Logging

Added detailed logging to track streaming performance:

```typescript
console.log("🔗 Calling backend directly:", url);
console.log("📡 Response status:", res.status);
console.log("📡 Response headers:", res.headers);
console.log("⚡ First chunk received! (read time:", readTime, "ms)");
console.log("📥 Streaming data [chunk", chunkCount + "]:", data);
```

### 4. Non-Blocking Stream Processing

```typescript
const processStream = async () => {
  while (true) {
    const { done, value } = await reader.read();
    // Process immediately...
    if (firstResponse) {
      setShowPdfHandler(true); // Shows immediately!
    }
  }
};

processStream(); // No await - runs in background!
```

## Environment Setup

### Required Environment Variables

Create `.env.local` file (or set in your deployment):

```bash
# Backend API URL
NEXT_PUBLIC_BASE_URL=http://localhost:8989

# Alternative (if different)
NEXT_PUBLIC_BLUEPRINTS_API_URL=http://localhost:8989
```

**Important**: Use `NEXT_PUBLIC_` prefix so it's accessible in the browser!

### Development

```bash
# .env.local
NEXT_PUBLIC_BASE_URL=http://localhost:8989
```

### Production

```bash
# .env.production
NEXT_PUBLIC_BASE_URL=https://api.yourdomain.com
```

## CORS Considerations

Since we're now calling the backend directly from the browser, the backend must support CORS:

### Backend CORS Configuration Required

```typescript
// Express.js example
app.use(cors({
  origin: [
    'http://localhost:3000',  // Development
    'https://yourdomain.com', // Production
  ],
  credentials: true,
  exposedHeaders: ['Content-Type', 'Transfer-Encoding'],
}));
```

**Important Headers:**
- `Access-Control-Allow-Origin`: Your frontend domain
- `Access-Control-Allow-Credentials`: true (for cookies)
- `Access-Control-Expose-Headers`: Content-Type, Transfer-Encoding

## Testing

### 1. Start Backend API

```bash
# Make sure your backend is running
cd backend
npm start
# Should be running on http://localhost:8989
```

### 2. Set Environment Variable

```bash
# In your terminal
export NEXT_PUBLIC_BASE_URL=http://localhost:8989

# Or create .env.local file
echo "NEXT_PUBLIC_BASE_URL=http://localhost:8989" > .env.local
```

### 3. Start Frontend

```bash
npm run dev
```

### 4. Test Upload

1. Open browser DevTools (Console + Network tabs)
2. Upload a PDF and submit
3. **Watch for these logs:**

```
🔗 Calling backend directly: http://localhost:8989/blueprints/create-blueprint
📡 Response status: 200
📡 Response headers: { ... }
🌊 Starting stream processing...
⚡ First chunk received! (read time: 150 ms)
📥 Streaming data [chunk 1]: { message: "Blueprint created..." }
🎯 First response received, showing PDF Handler
📄 Adding page 1 of 68
📄 Adding page 2 of 68
...
✅ Stream completed. Total chunks: 70
```

### 5. Verify Streaming

**Network Tab should show:**
- Request to `localhost:8989/blueprints/create-blueprint`
- Status: `(pending)` → `200`
- Type: `fetch`
- Time: Should match total processing time (60s+)

**UI should:**
- Show PDF Handler within 2-3 seconds
- Display progress bar updating live
- Show pages appearing one by one

## Expected Timeline

| Time | Event | What You See |
|------|-------|--------------|
| 0s | Click Submit | Loading spinner |
| 1s | Backend receives request | - |
| 2s | First chunk arrives | PDF Handler appears! |
| 3s | First page processed | Page 1 visible |
| 5s | More pages | Pages 2-3 visible |
| 10s | Continuous streaming | 8-10 pages visible |
| 60s | All pages processed | All 68 pages visible |

## Troubleshooting

### Issue: Still Seeing Pending

**Check:**
1. Environment variable is set correctly
   ```bash
   echo $NEXT_PUBLIC_BASE_URL
   ```

2. Backend is reachable
   ```bash
   curl http://localhost:8989/health
   ```

3. Browser console shows correct URL
   ```
   🔗 Calling backend directly: http://localhost:8989/...
   ```

### Issue: CORS Error

**Symptoms:**
```
Access to fetch at 'http://localhost:8989/...' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

**Fix:** Backend needs CORS configuration (see above)

### Issue: 401 Unauthorized

**Symptoms:**
```
📡 Response status: 401
```

**Check:**
1. Token exists in localStorage
   ```javascript
   console.log(localStorage.getItem("@token"));
   ```

2. Authorization header is being sent
   ```javascript
   console.log(headers); // Should include Authorization
   ```

3. Token is valid and not expired

### Issue: No Chunks Received

**Symptoms:**
```
🌊 Starting stream processing...
(nothing happens)
```

**Check:**
1. Backend is actually streaming (check backend logs)
2. Response has body
   ```
   📡 Response headers: { "transfer-encoding": "chunked" }
   ```
3. No proxy/CDN buffering between client and backend

## Performance Comparison

### Before (Buffered)

```
Submit → ... 60 seconds ... → Everything appears
         (user sees nothing)
```

### After (Streaming)

```
Submit → 2s → PDF Handler
      → 3s → Page 1
      → 5s → Pages 2-3
      → 10s → Pages 8-10
      → ... continues ...
      → 60s → All pages
```

**User can start interacting after just 2-3 seconds!**

## Summary

✅ **Direct backend calls** bypass Next.js buffering  
✅ **Client-side streaming** receives chunks immediately  
✅ **Real-time UI updates** show progress as it happens  
✅ **Manual auth headers** maintain security  
✅ **Detailed logging** helps debug issues  

The key insight: **Next.js API routes buffer responses by default**. For true streaming, call the backend API directly from the client.
