import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import QueueManager, { QueueJob } from "@/utils/queueManager";

const queueManager = QueueManager.getInstance();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const jobId = uuidv4();
    const uploadDir = join(process.cwd(), "uploads", jobId);

    // Create upload directory
    await mkdir(uploadDir, { recursive: true });

    const fileInfos = [];

    // Save files to disk
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = `${uuidv4()}_${file.name}`;
      const filePath = join(uploadDir, fileName);

      await writeFile(filePath, buffer);

      fileInfos.push({
        originalName: file.name,
        path: filePath,
        type: file.type,
        size: file.size,
      });
    }

    // Create job
    const job: QueueJob = {
      id: jobId,
      status: "pending",
      files: fileInfos,
      processedImages: [],
      createdAt: new Date(),
      progress: {
        total: fileInfos.length,
        processed: 0,
      },
    };

    // Add to queue for processing
    queueManager.addJob(job);

    return NextResponse.json({
      jobId,
      status: "queued",
      message: "Files uploaded and queued for processing",
      fileCount: fileInfos.length,
    });
  } catch (error) {
    console.error("Error in file upload:", error);
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "Job ID required" }, { status: 400 });
  }

  const job = queueManager.getJob(jobId);

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: job.id,
    status: job.status,
    processedImages: job.processedImages,
    error: job.error,
    progress: job.progress,
    createdAt: job.createdAt,
    completedAt: job.completedAt,
  });
}
