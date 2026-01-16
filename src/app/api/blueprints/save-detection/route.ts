import { NextResponse } from "next/server";

const BACKEND_BASE = process.env.NEXT_PUBLIC_BASE_URL || process.env.BLUEPRINTS_API_URL || "http://localhost:8989/api/v1";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Proxy to upstream backend. Adjust the upstream path if your backend uses a different route.
    const url = `${BACKEND_BASE}/blueprints/save-blueprint-image-detection`;

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json().catch(() => ({}));
    return NextResponse.json(data, { status: resp.ok ? 200 : resp.status });
  } catch (err) {
    console.error("Error proxying save-detection:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
