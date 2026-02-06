import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/utils/api";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const body = await req.json();
    const { projectId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const resp = await api.project.updateProject(projectId, body, token);
    return NextResponse.json(resp);
  } catch (err: unknown) {
    console.error("Project update error:", err);
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const resp = await api.project.deleteProject(projectId, token);
    return NextResponse.json(resp);
  } catch (err: unknown) {
    console.error("Project delete error:", err);
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
