import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/utils/api";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const resp = await api.project.createProject(body, token);
    console.log("======>resp", resp);
    return NextResponse.json(resp);
  } catch (err: unknown) {
    console.error("Project create error:", err);
    // If error has response-like shape, include it
    if (err && typeof err === "object" && "message" in err) {
      const message = String(
        (err as { message?: unknown }).message || "Internal Server Error"
      );
      return NextResponse.json({ message }, { status: 500 });
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
