import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { join } from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const [jobId, fileName] = params.path;

    if (!jobId || !fileName) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    console.log("Serving image (requested):", { jobId, fileName });

    // Build path to uploads folder created by process-queue
    const uploadsDir = join(process.cwd(), "uploads", jobId);
    const targetPath = join(uploadsDir, decodeURIComponent(fileName));

    try {
      const fileStat = await stat(targetPath);
      if (fileStat.isFile()) {
        const data = await readFile(targetPath);
        // Convert Buffer to Uint8Array for NextResponse body typing
        const body = new Uint8Array(data);
        // Determine content type from extension
        const ext = fileName.split(".").pop()?.toLowerCase();
        const contentType =
          ext === "png"
            ? "image/png"
            : ext === "jpg" || ext === "jpeg"
            ? "image/jpeg"
            : "application/octet-stream";

        return new NextResponse(body, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
    } catch (err) {
      console.log(
        "File not found on disk, falling back to placeholder:",
        targetPath
      );
      // fall through to placeholder
    }

    // Fallback placeholder SVG
    const placeholderSvg = `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" font-family="Arial" font-size="18" fill="#6b7280" text-anchor="middle">
          ${fileName}
        </text>
        <text x="50%" y="60%" font-family="Arial" font-size="12" fill="#9ca3af" text-anchor="middle">
          Job: ${jobId}
        </text>
      </svg>
    `;

    return new NextResponse(placeholderSvg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return NextResponse.json(
      { error: "Failed to serve image" },
      { status: 500 }
    );
  }
}
