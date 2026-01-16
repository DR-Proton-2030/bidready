import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const EXTERNAL_URL = `${process.env.NEXT_PUBLIC_BASE_URL || process.env.BLUEPRINTS_API_URL || 'http://localhost:8989/api/v1'}/project/get-projectIds`;

export async function GET(req: Request) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const resp = await fetch(EXTERNAL_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.ok ? 200 : resp.status });
  } catch (err: unknown) {
    console.error("Error proxying get-projectIds:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
