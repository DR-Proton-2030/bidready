import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/utils/api";

export async function POST(req: Request) {
  try {
    // Support multipart/form-data (file uploads) by forwarding the raw request
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const contentType = req.headers.get("content-type") || undefined;
    console.log(
      "[api/blueprints] token present:",
      !!token,
      "content-type:",
      contentType
    );
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // Read raw body
    const arrayBuffer = await req.arrayBuffer();

    // Forward to backend. Use NEXT_PUBLIC_BASE_URL so the backend URL is configurable.
    const backendUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/blueprints/create-blueprint`;
    console.log("[api/blueprints] forwarding to backend:", backendUrl);

    const backendResp = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(contentType ? { "Content-Type": contentType } : {}),
      },
      body: arrayBuffer,
    });

    const respBody = await backendResp.text();
    console.log("[api/blueprints] backend status:", backendResp.status);

    // Try to parse JSON, otherwise return text
    try {
      const json = JSON.parse(respBody);
      return NextResponse.json(json, { status: backendResp.status });
    } catch {
      return new NextResponse(respBody, {
        status: backendResp.status,
        headers: {
          "content-type":
            backendResp.headers.get("content-type") || "text/plain",
        },
      });
    }
  } catch (err: unknown) {
    console.error("Blueprint create error:", err);
    const message =
      err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = url.searchParams.get("page") || "1";
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    console.log("[api/blueprints] GET page=", page, " token present=", !!token);
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const resp = await api.blueprint.getBlueprints(
      { page: parseInt(page, 10) },
      token
    );
    return NextResponse.json(resp);
  } catch (err: unknown) {
    console.error("Blueprint list error:", err);
    const message =
      err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
