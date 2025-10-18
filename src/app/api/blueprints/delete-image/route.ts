import { NextRequest, NextResponse } from "next/server";
import QueueManager from "@/utils/queueManager";

const queueManager = QueueManager.getInstance();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, imagePath } = body || {};

    if (!jobId || !imagePath) {
      return NextResponse.json({ error: "jobId and imagePath required" }, { status: 400 });
    }

    const ok = await queueManager.deleteImage(jobId, imagePath);
    if (!ok) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in delete-image route:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
