import { NextResponse } from 'next/server';
// Forward to the "create-blueprint-only" upstream route which accepts arbitrary file fields
const UPSTREAM_URL = `${process.env.NEXT_PUBLIC_BASE_URL || process.env.BLUEPRINTS_API_URL || 'http://localhost:8989'}/blueprints/create-blueprint`;

export async function POST(request: Request) {
  try {
    // Read incoming multipart/form-data
    const incoming = await request.formData();

    // Rebuild outbound FormData so we can forward files and fields
    const outbound = new FormData();
    for (const [key, value] of incoming.entries()) {
      // value may be string or File
      // In the edge/Node runtime the File type is available globally
      // Append files with their original filename when possible
      // @ts-ignore
      if (value && typeof (value as any).name === 'string' && (value as any).arrayBuffer) {
        // It's a File-like object
        outbound.append(key, value as any, (value as any).name);
      } else {
        outbound.append(key, String(value));
      }
    }

    // Forward cookies/authorization from the original request
    const cookie = request.headers.get('cookie') ?? '';
    const auth = request.headers.get('authorization') ?? '';

    const res = await fetch(UPSTREAM_URL, {
      method: 'POST',
      body: outbound,
      headers: {
        // let fetch set Content-Type for multipart/form-data; forward auth cookies
        ...(cookie ? { cookie } : {}),
        ...(auth ? { authorization: auth } : {}),
      },
    });

    const contentType = res.headers.get('content-type') || 'application/json';
    const body = await res.arrayBuffer();

    return new Response(body, {
      status: res.status,
      headers: { 'content-type': contentType },
    });
  } catch (err) {
    console.error('Proxy create-blueprint-only error', err);
    return NextResponse.json({ message: 'Proxy error' }, { status: 500 });
  }
}
