import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    // Find PDF file in upload directory
    const uploadDir = path.join(process.cwd(), "uploads", jobId);

    if (!fs.existsSync(uploadDir)) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const files = fs.readdirSync(uploadDir);
    const pdfFile = files.find((file) => file.endsWith(".pdf"));

    if (!pdfFile) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 });
    }

    const pdfPath = path.join(uploadDir, pdfFile);
    const fileBuffer = await readFile(pdfPath);

    return new NextResponse(fileBuffer.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${pdfFile}"`,
      },
    });
  } catch (error) {
    console.error("Error loading PDF:", error);
    return NextResponse.json(
      { error: "Failed to load PDF" },
      { status: 500 }
    );
  }
}
