import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const pdfFile = formData.get("pdf_file") as File;

    if (!pdfFile) {
      return NextResponse.json(
        { error: "No PDF file provided" },
        { status: 400 }
      );
    }

    // Validate it's a PDF
    if (pdfFile.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    // Create unique job ID
    const jobId = uuidv4();

    // Create upload directory
    const uploadDir = path.join(process.cwd(), "uploads", jobId);
    await mkdir(uploadDir, { recursive: true });

    // Save PDF file
    const bytes = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const pdfPath = path.join(uploadDir, pdfFile.name);
    await writeFile(pdfPath, buffer);

    console.log(`PDF uploaded successfully: ${pdfPath}`);

    return NextResponse.json({
      success: true,
      jobId,
      pdfPath: `/uploads/${jobId}/${pdfFile.name}`,
      fileName: pdfFile.name,
    });
  } catch (error) {
    console.error("Error uploading PDF:", error);
    return NextResponse.json(
      { error: "Failed to upload PDF" },
      { status: 500 }
    );
  }
}
