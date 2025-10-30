import fs from 'fs'
import os from 'os'
import path from 'path'
import crypto from 'crypto'

type StoredFile = {
  filename: string
  path: string
  mime: string
}

type Entry = {
  dir: string
  files: StoredFile[]
  timeoutId?: NodeJS.Timeout
}

const STORE: Map<string, Entry> = new Map()
const TTL_MS = 1000 * 60 * 5 // 5 minutes

function genToken() {
  return crypto.randomBytes(16).toString('hex')
}

async function saveFiles(files: Array<{ name: string; buffer: ArrayBuffer; type?: string }>) {
  const token = genToken()
  const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'temp-upload-'))
  const stored: StoredFile[] = []

  for (const f of files) {
    const filename = `${Date.now()}_${f.name}`
    const outPath = path.join(dir, filename)
    const buf = Buffer.from(f.buffer)
    await fs.promises.writeFile(outPath, buf)
    stored.push({ filename: f.name, path: outPath, mime: f.type || 'application/octet-stream' })
  }

  const timeoutId = setTimeout(() => {
    // cleanup after TTL
    cleanup(token).catch(() => {})
  }, TTL_MS)

  STORE.set(token, { dir, files: stored, timeoutId })
  return { token, files: stored }
}

async function getFiles(token: string) {
  const entry = STORE.get(token)
  if (!entry) return null
  return entry.files
}

async function readFileBuffer(token: string, filename: string) {
  const entry = STORE.get(token)
  if (!entry) return null
  const f = entry.files.find((x) => x.filename === filename || x.filename === filename)
  if (!f) return null
  const buf = await fs.promises.readFile(f.path)
  return { buffer: buf, mime: f.mime, filename: f.filename }
}

async function cleanup(token: string) {
  const entry = STORE.get(token)
  if (!entry) return
  // clear timeout
  if (entry.timeoutId) clearTimeout(entry.timeoutId)
  // remove files and directory
  try {
    for (const f of entry.files) {
      try { await fs.promises.unlink(f.path) } catch (e) {}
    }
    await fs.promises.rmdir(entry.dir)
  } catch (e) {
    // ignore cleanup errors
  }
  STORE.delete(token)
}

export { saveFiles, getFiles, readFileBuffer, cleanup }
