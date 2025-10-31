# Quick Setup Guide - Streaming Blueprint Upload

## Step 1: Set Environment Variable

Create `.env.local` in your project root:

```bash
# .env.local
NEXT_PUBLIC_BASE_URL=http://localhost:8989
```

**Important:** Must start with `NEXT_PUBLIC_` to be accessible in browser!

## Step 2: Verify Backend CORS

Your backend needs CORS enabled. Check your backend has something like:

```typescript
// Backend CORS config
app.use(cors({
  origin: 'http://localhost:3000',  // Your Next.js frontend
  credentials: true,
}));
```

## Step 3: Restart Dev Server

```bash
# Stop current dev server (Ctrl+C)
# Start again to load environment variable
npm run dev
```

## Step 4: Test It!

1. Open http://localhost:3000/create-blueprint
2. Open Browser DevTools (Console + Network tabs)
3. Fill form and upload a PDF
4. Click "Create Blueprint"
5. Watch the console:

```
🔗 Calling backend directly: http://localhost:8989/blueprints/create-blueprint
⚡ First chunk received! (read time: 150 ms)
🎯 First response received, showing PDF Handler
📄 Adding page 1 of 68
📄 Adding page 2 of 68
```

## Expected Behavior

✅ PDF Handler appears within **2-3 seconds**  
✅ Progress bar shows and updates live  
✅ Pages appear one by one  
✅ Network tab shows "pending" while streaming  

## If It's Not Working

### Check 1: Environment Variable

```bash
# In terminal
echo $NEXT_PUBLIC_BASE_URL
# Should output: http://localhost:8989
```

### Check 2: Backend Running

```bash
curl http://localhost:8989/health
# Should return success
```

### Check 3: Browser Console

Look for:
```
🔗 Calling backend directly: http://localhost:8989/...
```

If you see `/api/blueprints/create-blueprint` instead, the env var isn't loaded.

### Check 4: CORS Error?

If you see CORS error in console, backend needs CORS configuration.

## Production Setup

For production, set the environment variable in your deployment platform:

**Vercel:**
```
Settings → Environment Variables → Add
Name: NEXT_PUBLIC_BASE_URL
Value: https://api.yourdomain.com
```

**Netlify:**
```
Site settings → Environment variables → Add
Key: NEXT_PUBLIC_BASE_URL
Value: https://api.yourdomain.com
```

**Docker:**
```bash
docker run -e NEXT_PUBLIC_BASE_URL=https://api.yourdomain.com ...
```

## Done! 🎉

Your PDF upload should now stream in real-time with immediate feedback!
