"use client"
import React from 'react'
import { ArrowUpRight, Trash2, Scan, CheckCircle2 } from 'lucide-react'

export type FilePreview = {
  file?: File | null
  src: string
  name?: string
  remote?: boolean
  overlay?: boolean
  overlayData?: any
  id?: string
}

type Props = {
  p: FilePreview
  idx: number
  onRemove: (index: number) => void
  onViewDetection: (p: FilePreview) => void
}

const ImagePreview: React.FC<Props> = ({ p, idx, onRemove, onViewDetection }) => {
  const animationDelay = `${idx * 100}ms`

  return (
    <div
      className="group relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300"
      style={{
        animationName: 'fadeInUp',
        animationDuration: '0.5s',
        animationFillMode: 'both',
        animationDelay,
      }}
    >
      {/* Image Background */}
      <img
        src={p.src}
        alt={p.file?.name ?? p.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Dark Gradient Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Top Bar: Status & Delete */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
        {/* Status Badge */}
        {p.overlay ? (
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm backdrop-blur-md">
            <CheckCircle2 className="w-3 h-3" />
            <span>Ready</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600 shadow-sm backdrop-blur-md">
            <Scan className="w-3 h-3" />
            <span>Pending</span>
          </div>
        )}

        {/* Delete Button (Visible on Hover) */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove(idx)
          }}
          className="translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 rounded-full bg-white/20 p-2 text-white hover:bg-red-500 hover:text-white backdrop-blur-md"
          aria-label="Remove"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Center Action Button (Visible on Hover) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
        <button
          onClick={() => onViewDetection(p)}
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          {p.overlay ? (
            <>
              <span>View Plan</span>
              <ArrowUpRight className="w-4 h-4 text-slate-500" />
            </>
          ) : (
            <>
              <Scan className="w-4 h-4 text-indigo-600" />
              <span>Detect</span>
            </>
          )}
        </button>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <p className="truncate text-sm font-medium text-white">
          {p.file?.name ?? p.name}
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default ImagePreview
