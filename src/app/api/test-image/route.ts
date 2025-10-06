import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("Test image route accessed");

  // Create a simple test SVG
  const testSvg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#10b981"/>
      <text x="50%" y="50%" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">
        TEST IMAGE WORKING!
      </text>
      <text x="50%" y="70%" font-family="Arial" font-size="12" fill="#dcfce7" text-anchor="middle" dominant-baseline="middle">
        ${new Date().toISOString()}
      </text>
    </svg>
  `;

  return new NextResponse(testSvg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
