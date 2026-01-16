import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const EXTERNAL_URL_BASE = `${process.env.NEXT_PUBLIC_BASE_URL || process.env.BLUEPRINTS_API_URL || 'http://localhost:8989/api/v1'}/blueprints/get-blueprint-details`;

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const blueprintId = params.id;
    const token = (await cookies()).get("token")?.value;
    const url = `${EXTERNAL_URL_BASE}/${blueprintId}`;

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
