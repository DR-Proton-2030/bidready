// Simple in-memory queue manager for blueprint processing
// In production, this should use Redis or a proper queue service

export interface QueueJob {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  files: {
    originalName: string;
    path: string;
    type: string;
    size: number;
  }[];
  processedImages: {
    id: string;
    name: string;
    path: string;
    pageNumber?: number;
    processingTime?: number;
  }[];
  error?: string;
  createdAt: Date;
  completedAt?: Date;
  progress: {
    total: number;
    processed: number;
    currentFile?: string;
  };
}

import { dirname, basename, extname, join } from "path";
import { writeFile, readFile, readdir, stat as fsStat } from "fs/promises";
import { execFile } from "child_process";
import { promisify } from "util";
import { EventEmitter } from "events";
import { watch } from "fs";

const execFileAsync = promisify(execFile);

// We'll use puppeteer to render PDFs in a headless Chromium (avoids native canvas builds)
// import puppeteer dynamically to avoid type issues if not installed during type-check
const puppeteer = require("puppeteer");

class QueueManager {
  private static instance: QueueManager;
  private jobs = new Map<string, QueueJob>();
  private processingQueue: string[] = [];
  private isProcessing = false;
  private emitter = new EventEmitter();

  static getInstance(): QueueManager {
    if (!QueueManager.instance) {
      QueueManager.instance = new QueueManager();
    }
    return QueueManager.instance;
  }

  addJob(job: QueueJob): void {
    this.jobs.set(job.id, job);
    this.processingQueue.push(job.id);
    // notify queued status
    this.notify(job.id, { type: "status", status: "pending", progress: job.progress });
    this.processNext();
  }

  getJob(jobId: string): QueueJob | undefined {
    return this.jobs.get(jobId);
  }

  updateJob(jobId: string, updates: Partial<QueueJob>): void {
    const job = this.jobs.get(jobId);
    if (job) {
      Object.assign(job, updates);
      this.jobs.set(jobId, job);
      this.notify(jobId, { type: "progress", progress: job.progress, status: job.status });
    }
  }

  // Subscribe to real-time job events (SSE uses this)
  onJob(jobId: string, listener: (evt: any) => void): void {
    this.emitter.on(`job:${jobId}`, listener);
  }

  offJob(jobId: string, listener: (evt: any) => void): void {
    this.emitter.off(`job:${jobId}`, listener);
  }

  private notify(jobId: string, payload: any): void {
    this.emitter.emit(`job:${jobId}`, { jobId, ...payload });
  }

  // Remove a processed image from a job and optionally delete the file on disk
  async deleteImage(jobId: string, imagePath: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    const idx = job.processedImages.findIndex((i) => i.path === imagePath || i.path.endsWith(encodeURIComponent(imagePath)));
    if (idx === -1) return false;

    const removed = job.processedImages.splice(idx, 1);
    // update progress counts
    job.progress.processed = Math.max(0, (job.progress.processed || 0) - 1);
    this.jobs.set(jobId, job);

    try {
      // Try to remove the physical file under uploads/<jobId> if the stored path matches that pattern
      // path stored in processedImages is like `/api/blueprints/serve-image/${job.id}/${encodeURIComponent(fileName)}`
      const prefix = `/api/blueprints/serve-image/${jobId}/`;
      if (imagePath.startsWith(prefix)) {
        const encodedName = imagePath.slice(prefix.length);
        const fileName = decodeURIComponent(encodedName);
        const fsPath = join(process.cwd(), "uploads", jobId, fileName);
        // delete file if exists
        try {
          await (await import("fs/promises")).unlink(fsPath);
        } catch (e) {
          // ignore if file missing
        }
      }
    } catch (e) {
      // ignore file deletion errors but keep the job updated
    }

    return true;
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const jobId = this.processingQueue.shift();

    if (jobId) {
      await this.processJob(jobId);
    }

    this.isProcessing = false;

    // Process next job if available
    if (this.processingQueue.length > 0) {
      setTimeout(() => this.processNext(), 100);
    }
  }

  private async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    try {
      job.status = "processing";
      job.progress.currentFile = "Starting processing...";
      this.jobs.set(jobId, job);
      this.notify(jobId, { type: "status", status: job.status, progress: job.progress });

      for (let i = 0; i < job.files.length; i++) {
        const file = job.files[i];
        job.progress.currentFile = file.originalName;
        this.jobs.set(jobId, job);

        await this.processFile(job, file);

        job.progress.processed = i + 1;
        this.jobs.set(jobId, job);

        // Simulate processing time
        await this.delay(1500 + Math.random() * 2000);
      }

      job.status = "completed";
      job.completedAt = new Date();
      job.progress.currentFile = undefined;
      this.jobs.set(jobId, job);
      this.notify(jobId, { type: "status", status: job.status, progress: job.progress });
    } catch (error) {
      console.error("Error processing job:", error);
      job.status = "failed";
      job.error = error instanceof Error ? error.message : "Unknown error";
      this.jobs.set(jobId, job);
      this.notify(jobId, { type: "error", error: job.error, status: job.status });
    }
  }

  private async processFile(
    job: QueueJob,
    file: { originalName: string; path: string; type: string; size: number }
  ): Promise<void> {
    const startTime = Date.now();

    try {
      if (
        file.type === "application/pdf" ||
        extname(file.path).toLowerCase() === ".pdf"
      ) {
        // First try using Poppler's pdftoppm to render pages to PNG (fast, simple on macOS/Linux)
        const uploadDir = dirname(file.path);
        const parsedBase = basename(file.path, extname(file.path));

        const outPrefix = join(uploadDir, `${parsedBase}_page`);
        let usedPoppler = false;
        try {
          // Try to get total pages via pdfinfo (if available) so we can report progress early
          try {
            const { stdout } = await execFileAsync("pdfinfo", [file.path]);
            const match = stdout.match(/Pages:\s+(\d+)/i);
            if (match) {
              const total = parseInt(match[1], 10);
              job.progress = job.progress || { total: 0, processed: 0 };
              job.progress.total = total;
              this.jobs.set(job.id, job);
              this.notify(job.id, { type: "progress", progress: job.progress });
            }
          } catch {}

          // Watch for new PNG files as pdftoppm renders them, to stream one-by-one
          const seen = new Set<string>();
          const watcher = watch(uploadDir, async (_event, filename) => {
            try {
              if (!filename) return;
              if (!filename.startsWith(`${parsedBase}_page-`) || !filename.endsWith(".png")) return;
              if (seen.has(filename)) return;
              seen.add(filename);
              // Ensure file is fully written and stable before emitting
              const pngPath = join(uploadDir, filename);
              await this.waitForFileStable(pngPath);
              // Derive page number
              const pageNumber = parseInt(filename.split("-" ).pop()!.replace(/\.png$/, ""), 10);
              const processedImage = {
                id: `${job.id}_${filename}`,
                name: `${file.originalName} - Page ${pageNumber}`,
                path: `/api/blueprints/serve-image/${job.id}/${encodeURIComponent(filename)}`,
                pageNumber,
                processingTime: Date.now() - startTime,
              };
              job.processedImages.push(processedImage);
              job.progress = job.progress || { total: 0, processed: 0 };
              job.progress.processed = (job.progress.processed || 0) + 1;
              this.jobs.set(job.id, job);
              this.notify(job.id, { type: "image", image: processedImage, progress: job.progress });
            } catch (e) {
              // ignore
            }
          });

          // Run pdftoppm -png -r 150 <input.pdf> <outPrefix>
          await execFileAsync("pdftoppm", ["-png", "-r", "150", file.path, outPrefix]);
          usedPoppler = true;
          try { watcher.close(); } catch {}

          // If we couldn't detect any images via watcher (rare), register them after the fact
          if (job.processedImages.length === 0) {
            const files = await readdir(uploadDir);
            const pagePngs = files
              .filter((f) => f.startsWith(`${parsedBase}_page-`) && f.endsWith(".png"))
              .sort((a, b) => {
                const pa = parseInt(a.split("-" ).pop()!.replace(/\.png$/, ""), 10);
                const pb = parseInt(b.split("-" ).pop()!.replace(/\.png$/, ""), 10);
                return pa - pb;
              });
            if (!job.progress) job.progress = { total: 0, processed: 0 };
            if (!job.progress.total) job.progress.total = pagePngs.length;
            for (let idx = 0; idx < pagePngs.length; idx++) {
              const outFileName = pagePngs[idx];
              const pageNumber = idx + 1;
              const processedImage = {
                id: `${job.id}_${outFileName}`,
                name: `${file.originalName} - Page ${pageNumber}`,
                path: `/api/blueprints/serve-image/${job.id}/${encodeURIComponent(outFileName)}`,
                pageNumber,
                processingTime: Date.now() - startTime,
              };
              job.processedImages.push(processedImage);
              job.progress.processed = (job.progress.processed || 0) + 1;
              this.notify(job.id, { type: "image", image: processedImage, progress: job.progress });
            }
            this.jobs.set(job.id, job);
            this.notify(job.id, { type: "progress", progress: job.progress });
          }
        } catch (popplerErr) {
          // If pdftoppm is not available (ENOENT) or failed, fall back to Puppeteer + pdf.js
          let browser: any | undefined;
          let pageBrowser: any | undefined;
          try {
            browser = await puppeteer.launch({
              headless: true,
              args: ["--no-sandbox", "--disable-setuid-sandbox"],
            });
            pageBrowser = await browser.newPage();

            // Read PDF file bytes and pass to the browser as base64 to avoid file:// issues
            const pdfBuffer = await readFile(file.path);
            const pdfBase64 = pdfBuffer.toString("base64");

            // Always inject pdf.js from node_modules (avoid CDN flakiness)
            try {
              const legacyPdfjsPath = join(
                process.cwd(),
                "node_modules",
                "pdfjs-dist",
                "legacy",
                "build",
                "pdf.js"
              );
              const pdfjsCode = await readFile(legacyPdfjsPath, { encoding: "utf8" });
              await pageBrowser.addScriptTag({ content: pdfjsCode });
            } catch {
              const pdfjsBrowserPath = join(
                process.cwd(),
                "node_modules",
                "pdfjs-dist",
                "build",
                "pdf.js"
              );
              const pdfjsCode = await readFile(pdfjsBrowserPath, { encoding: "utf8" });
              await pageBrowser.addScriptTag({ content: pdfjsCode });
            }

            // Try to inline worker as a Blob URL; if not found, render with disableWorker
            let workerCode = "";
            try {
              const workerPath = join(
                process.cwd(),
                "node_modules",
                "pdfjs-dist",
                "legacy",
                "build",
                "pdf.worker.js"
              );
              workerCode = await readFile(workerPath, { encoding: "utf8" });
            } catch {
              try {
                const workerPath = join(
                  process.cwd(),
                  "node_modules",
                  "pdfjs-dist",
                  "build",
                  "pdf.worker.js"
                );
                workerCode = await readFile(workerPath, { encoding: "utf8" });
              } catch {}
            }

            let hasInlineWorker = false;
            if (workerCode) {
              hasInlineWorker = true;
              await pageBrowser.evaluateOnNewDocument((code: string) => {
                const blob = new Blob([code], { type: "text/javascript" });
                // @ts-ignore
                (window as any)._pdfjsWorkerBlobUrl = URL.createObjectURL(blob);
              }, workerCode);
            }

            // Stream rendered pages back to Node and write them to disk
            await pageBrowser.exposeFunction(
              "sendPageData",
              async (dataUrl: string, pageNumber: number) => {
                try {
                  const base64 = dataUrl.split(",")[1];
                  const buffer = Buffer.from(base64, "base64");
                  const outFileName = `${parsedBase}_page-${pageNumber}.png`;
                  const outPath = join(uploadDir, outFileName);
                  await writeFile(outPath, buffer);

                  const processedImage = {
                    id: `${job.id}_${outFileName}`,
                    name: `${file.originalName} - Page ${pageNumber}`,
                    path: `/api/blueprints/serve-image/${job.id}/${encodeURIComponent(outFileName)}`,
                    pageNumber,
                    processingTime: Date.now() - startTime,
                  };

                  job.processedImages.push(processedImage);
                  job.progress = job.progress || { total: 0, processed: 0 };
                  job.progress.processed = (job.progress.processed || 0) + 1;
                  this.notify(job.id, { type: "image", image: processedImage, progress: job.progress });
                  this.jobs.set(job.id, job);
                } catch (e) {
                  console.error("Error writing page from browser:", e);
                }
              }
            );

            const numPages: number = await pageBrowser.evaluate(
              async (base64Pdf: string, useWorker: boolean) => {
                // @ts-ignore
                const pdfjsLib =
                  (window as any).pdfjsLib ||
                  (window as any).PDFJS ||
                  (window as any).pdfjs;
                if (!pdfjsLib) throw new Error("pdfjsLib not found in browser context");

                try {
                  // @ts-ignore
                  pdfjsLib.GlobalWorkerOptions = pdfjsLib.GlobalWorkerOptions || {};
                  if (useWorker && (window as any)._pdfjsWorkerBlobUrl) {
                    // @ts-ignore
                    pdfjsLib.GlobalWorkerOptions.workerSrc = (window as any)._pdfjsWorkerBlobUrl;
                  } else {
                    // Fallback to CDN worker if inline worker is not available
                    // @ts-ignore
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
                  }
                } catch (e) {
                  console.warn('Failed to set worker options:', e);
                }

                const binaryString = atob(base64Pdf);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);

                const loadingTask = pdfjsLib.getDocument({
                  data: bytes,
                  disableWorker: !useWorker,
                });
                const pdf = await loadingTask.promise;

                for (let p = 1; p <= pdf.numPages; p++) {
                  const page = await pdf.getPage(p);
                  const scale = 2;
                  const viewport = page.getViewport({ scale });
                  const canvas = document.createElement("canvas");
                  canvas.width = Math.floor(viewport.width);
                  canvas.height = Math.floor(viewport.height);
                  const ctx = canvas.getContext("2d");
                  if (!ctx) throw new Error("Failed to get 2D context from canvas");
                  await page.render({ canvasContext: ctx as any, viewport }).promise;
                  const dataUrl = canvas.toDataURL("image/png");
                  // @ts-ignore
                  await (window as any).sendPageData(dataUrl, p);
                }

                return pdf.numPages;
              },
              pdfBase64,
              hasInlineWorker
            );

            job.progress = job.progress || { total: 0, processed: 0 };
            job.progress.total = numPages;
            this.notify(job.id, { type: "progress", progress: job.progress });
            this.jobs.set(job.id, job);
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            const installHints = `Failed to process PDF (Poppler fallback to Puppeteer failed): ${message}`;
            job.status = "failed";
            job.error = installHints;
            this.jobs.set(job.id, job);
            throw new Error(installHints);
          } finally {
            try { await pageBrowser?.close(); } catch {}
            try { await browser?.close(); } catch {}
          }
        }
      } else {
        // For image files we already saved the original uploaded file to the uploads/<jobId>/ folder
        // Use the basename of the saved file so the serve endpoint can find it
        const fileNameOnDisk = basename(file.path);
        const processedImage = {
          id: `${job.id}_${fileNameOnDisk}`,
          name: file.originalName,
          path: `/api/blueprints/serve-image/${job.id}/${encodeURIComponent(
            fileNameOnDisk
          )}`,
          processingTime: Date.now() - startTime,
        };

        job.processedImages.push(processedImage);
        this.jobs.set(job.id, job);
      }
    } catch (error) {
      console.error("Error processing file:", file.originalName, error);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Wait until a file exists and its size is stable across two checks
  private async waitForFileStable(filePath: string, timeoutMs = 10000): Promise<void> {
    const start = Date.now();
    let lastSize = -1;
    let stableOnce = false;
    while (Date.now() - start < timeoutMs) {
      try {
        const s = await fsStat(filePath);
        if (s.size > 0) {
          if (s.size === lastSize) {
            if (stableOnce) return; // two consecutive stable checks
            stableOnce = true;
          } else {
            stableOnce = false;
          }
          lastSize = s.size;
        }
      } catch {
        // file not yet present
      }
      await this.delay(60);
    }
  }

  // Cleanup old jobs (call this periodically)
  cleanup(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = new Date(Date.now() - maxAge);

    for (const [jobId, job] of this.jobs.entries()) {
      if (job.createdAt < cutoff) {
        this.jobs.delete(jobId);
      }
    }
  }

  // Get queue statistics
  getStats(): {
    totalJobs: number;
    pendingJobs: number;
    processingJobs: number;
    completedJobs: number;
    failedJobs: number;
  } {
    const jobs = Array.from(this.jobs.values());

    return {
      totalJobs: jobs.length,
      pendingJobs: jobs.filter((j) => j.status === "pending").length,
      processingJobs: jobs.filter((j) => j.status === "processing").length,
      completedJobs: jobs.filter((j) => j.status === "completed").length,
      failedJobs: jobs.filter((j) => j.status === "failed").length,
    };
  }
}

export default QueueManager;
