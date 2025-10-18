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
import { writeFile, readFile } from "fs/promises";

// We'll use puppeteer to render PDFs in a headless Chromium (avoids native canvas builds)
// import puppeteer dynamically to avoid type issues if not installed during type-check
const puppeteer = require("puppeteer");

class QueueManager {
  private static instance: QueueManager;
  private jobs = new Map<string, QueueJob>();
  private processingQueue: string[] = [];
  private isProcessing = false;

  static getInstance(): QueueManager {
    if (!QueueManager.instance) {
      QueueManager.instance = new QueueManager();
    }
    return QueueManager.instance;
  }

  addJob(job: QueueJob): void {
    this.jobs.set(job.id, job);
    this.processingQueue.push(job.id);
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
    }
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
    } catch (error) {
      console.error("Error processing job:", error);
      job.status = "failed";
      job.error = error instanceof Error ? error.message : "Unknown error";
      this.jobs.set(jobId, job);
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
        // Real PDF processing using pdftoppm (poppler). This will generate PNGs in the same upload dir.
        const uploadDir = dirname(file.path);
        const parsedBase = basename(file.path, extname(file.path));

        // Use Puppeteer + pdfjs in a headless browser to render PDF pages to PNGs

        try {
          const browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
          });
          const pageBrowser = await browser.newPage();

          // Read PDF file bytes and pass to the browser as base64 to avoid bundler and file:// issues
          const pdfBuffer = await readFile(file.path);
          const pdfBase64 = pdfBuffer.toString("base64");

          // Prefer loading pdfjs from the CDN inside the headless browser to
          // avoid bundler/virtual-module path issues and to allow the worker to
          // be fetched from a stable URL. If offline, fall back to local injection.
          const pdfjsCdn = "https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.js";
          const pdfjsWorkerCdn =
            "https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.js";

          try {
            // Make the worker CDN URL available inside the page before any scripts run
            await pageBrowser.evaluateOnNewDocument((url: string) => {
              // @ts-ignore
              (window as any)._pdfjsWorkerCdn = url;
            }, pdfjsWorkerCdn);

            await pageBrowser.addScriptTag({ url: pdfjsCdn });
          } catch (cdnErr) {
            // fallback to local file injection if CDN isn't reachable
            try {
              const legacyPdfjsPath = join(
                process.cwd(),
                "node_modules",
                "pdfjs-dist",
                "legacy",
                "build",
                "pdf.js"
              );
              const pdfjsCode = await readFile(legacyPdfjsPath, {
                encoding: "utf8",
              });
              await pageBrowser.addScriptTag({ content: pdfjsCode });
            } catch (localErr) {
              // final fallback
              const pdfjsBrowserPath = join(
                process.cwd(),
                "node_modules",
                "pdfjs-dist",
                "build",
                "pdf.js"
              );
              const pdfjsCode = await readFile(pdfjsBrowserPath, {
                encoding: "utf8",
              });
              await pageBrowser.addScriptTag({ content: pdfjsCode });
              console.log(localErr);
            }
          }

          // Read pdf.worker.js and pass its source to the page so pdfjs can spawn a worker
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
          } catch (e) {
            try {
              const workerPath = join(
                process.cwd(),
                "node_modules",
                "pdfjs-dist",
                "build",
                "pdf.worker.js"
              );
              workerCode = await readFile(workerPath, { encoding: "utf8" });
              console.log(e);
            } catch (err) {
              // If we can't find a worker file, we'll fall back to disableWorker within the page
              workerCode = "";
              console.log(err);
            }
          }

          // Stream pages as they are rendered: expose a Node callback that the page will call
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
                  path: `/api/blueprints/serve-image/${
                    job.id
                  }/${encodeURIComponent(outFileName)}`,
                  pageNumber: pageNumber,
                  processingTime: Date.now() - startTime,
                };

                job.processedImages.push(processedImage);
                // update progress so the UI can reflect partial results
                job.progress = job.progress || { total: 0, processed: 0 };
                job.progress.processed = (job.progress.processed || 0) + 1;
                this.jobs.set(job.id, job);
              } catch (e) {
                console.error("Error writing page from browser:", e);
              }
            }
          );

          // In the browser, load the PDF and call window.sendPageData(dataUrl, pageNumber) for each page
          const numPages: number = await pageBrowser.evaluate(
            async (base64Pdf: string) => {
              // @ts-ignore
              const pdfjsLib =
                (window as any).pdfjsLib ||
                (window as any).PDFJS ||
                (window as any).pdfjs;
              if (!pdfjsLib)
                throw new Error("pdfjsLib not found in browser context");

              try {
                // @ts-ignore
                pdfjsLib.GlobalWorkerOptions =
                  pdfjsLib.GlobalWorkerOptions || {};
                // @ts-ignore
                if ((window as any)._pdfjsWorkerCdn)
                  pdfjsLib.GlobalWorkerOptions.workerSrc = (
                    window as any
                  )._pdfjsWorkerCdn;
              } catch (e) {}

              const binaryString = atob(base64Pdf);
              const len = binaryString.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; i++)
                bytes[i] = binaryString.charCodeAt(i);

              const hasWorker = !!(
                pdfjsLib.GlobalWorkerOptions &&
                pdfjsLib.GlobalWorkerOptions.workerSrc
              );
              const loadingTask = pdfjsLib.getDocument({
                data: bytes,
                disableWorker: !hasWorker,
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
                if (!ctx)
                  throw new Error("Failed to get 2D context from canvas");
                await page.render({ canvasContext: ctx as any, viewport })
                  .promise;
                const dataUrl = canvas.toDataURL("image/png");
                // @ts-ignore
                await (window as any).sendPageData(dataUrl, p);
              }

              return pdf.numPages;
            },
            pdfBase64
          );

          // set total pages for progress tracking
          job.progress = job.progress || { total: 0, processed: 0 };
          job.progress.total = numPages;
          this.jobs.set(job.id, job);

          await browser.close();
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          const installHints = `Failed to process PDF using Puppeteer: ${message}`;
          job.status = "failed";
          job.error = installHints;
          this.jobs.set(job.id, job);
          throw new Error(installHints);
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
