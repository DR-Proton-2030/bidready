import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/utils/api";

interface RouteParams {
  params: Promise<{ blueprintId: string }>;
}

// PATCH - Update blueprint details
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { blueprintId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const response = await api.blueprint.updateBlueprint(blueprintId, body, token);

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Failed to update blueprint:", error);
    const message = error instanceof Error ? error.message : "Failed to update blueprint";
    return NextResponse.json({ message }, { status: 500 });
  }
}
