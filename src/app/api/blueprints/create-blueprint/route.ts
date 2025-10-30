import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Upstream service URL; override in env if needed
const UPSTREAM_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/blueprints/create-blueprint`; 

export async function POST(request: NextRequest) {
  try {
    // Read incoming multipart form-data
    const incoming = await request.formData()
  const token = (await cookies()).get("token")?.value;
    // Rebuild a fresh FormData to forward to upstream (keeps Files intact)
    const outbound = new FormData()
    for (const [key, value] of incoming.entries()) {
      if (value instanceof File) {
        outbound.append(key, value, value.name)
      } else {
        outbound.append(key, value as string)
      }
    }

    const resp = await fetch(UPSTREAM_URL, {
      method: 'POST',
        headers: token
        ? {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          }
        : { Accept: "application/json" },
      body: outbound,
      // Do NOT set Content-Type manually; fetch will set the correct boundary
    })

    const contentType = resp.headers.get('content-type') || 'application/json'
    const text = await resp.text()

    return new Response(text, {
      status: resp.status,
      headers: { 'content-type': contentType },
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Proxy error', message: err?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
