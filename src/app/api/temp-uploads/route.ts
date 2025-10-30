import { NextRequest, NextResponse } from 'next/server'
import { saveFiles, getFiles } from '@/utils/tempStore'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files: Array<{ name: string; buffer: ArrayBuffer; type?: string }> = []
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        const buffer = await value.arrayBuffer()
        files.push({ name: value.name, buffer, type: value.type })
      }
    }

    if (!files.length) {
      return NextResponse.json({ error: 'no files' }, { status: 400 })
    }

    const { token, files: stored } = await saveFiles(files)

    // set cookie with token (client will also set a cookie as fallback)
    const res = NextResponse.json({ token, files: stored })
    res.cookies.set('TempUploadToken', token, { maxAge: 60 * 5, path: '/', sameSite: 'lax' })
    return res
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'upload failed' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const token = url.searchParams.get('token')
    if (!token) return NextResponse.json({ error: 'missing token' }, { status: 400 })
    const files = await getFiles(token)
    if (!files) return NextResponse.json({ error: 'token not found' }, { status: 404 })
    return NextResponse.json({ files })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'failed' }, { status: 500 })
  }
}
