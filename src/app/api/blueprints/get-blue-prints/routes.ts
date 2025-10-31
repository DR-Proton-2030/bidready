import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const EXTERNAL_URL_BASE = `${process.env.NEXT_PUBLIC_BASE_URL || process.env.BLUEPRINTS_API_URL || 'http://localhost:8989'}/api/v1/blueprints`;

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("-====> api call")
    const blueprintId = params.id;
    const token = (await cookies()).get("token")?.value;
  // Upstream endpoint that returns blueprint images
  const url = `http://localhost:8989/api/v1/blueprints/get-blueprint-images/${encodeURIComponent(blueprintId)}`;

    const resp = await fetch(url, {
      method: "GET",
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          }
        : { Accept: "application/json" },
      cache: "no-store",
    });

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.ok ? 200 : resp.status });
  } catch (err) {
    console.error("Error in proxy get-blueprint-details route:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
