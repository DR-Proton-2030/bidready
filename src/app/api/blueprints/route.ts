import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/utils/api";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    console.log("[api/blueprints] POST body:", body);
    console.log("[api/blueprints] token present:", !!token);
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const resp = await api.blueprint.createBlueprint(body, token);
    console.log("[api/blueprints] resp:", resp);
    return NextResponse.json(resp);
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
