"use client"
import React from 'react'
import { ArrowUpRight, Trash2 } from 'lucide-react'

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
  const animationDelay = `${idx * 80}ms`

  return (
    <div
      className="relative w-full h-40 rounded-xl overflow-hidden border"
      style={{
        animationName: 'slideIn',
        animationDuration: '420ms',
        animationTimingFunction: 'cubic-bezier(.2,.9,.3,1)',
        animationFillMode: 'both',
        animationDelay,
      }}
    >
      {p.overlay ? (
        <div
          onClick={() => onViewDetection(p)}
          className="absolute left-3 top-3 z-20 pl-2 pr-4 py-2 rounded-lg shadow-lg shadow-gray-400 bg-green-600/90 text-white text-md font-medium flex items-center gap-1 cursor-pointer"
        >
          <ArrowUpRight />
          View Detection
        </div>
      ) : (
        <div className="absolute left-3 top-3 z-20 pl-2 pr-4 py-2 cursor-pointer rounded-lg shadow-lg shadow-gray-400 bg-[#e16349] text-white text-md font-medium flex items-center gap-1">
          <ArrowUpRight />
          Detect Image
        </div>
      )}

      <img src={p.src} alt={p.file?.name ?? p.name} className="w-full h-full object-cover" />

      <button
        className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full hover:bg-black/70"
        onClick={() => onRemove(idx)}
        aria-label="Remove image"
      >
        <Trash2 className="w-4 h-4 text-white" />
      </button>

      <p className="text-xs text-center mt-1 text-gray-500 truncate">{p.file?.name ?? p.name}</p>

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(-18px); opacity: 0 }
          to { transform: translateX(0); opacity: 1 }
        }
      `}</style>
    </div>
  )
}

export default ImagePreview
