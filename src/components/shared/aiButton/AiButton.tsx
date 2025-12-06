import { Sparkle, Sparkles } from 'lucide-react'
import React from 'react'

const AiButton = ({ onClick }: any) => {
    return (
        <button
            onClick={onClick}
            className="group relative flex items-center gap-2 h-10 px-5 rounded-xl 
            bg-gradient-to-br
            from-orange-500 via-orange-500 to-rose-500
            text-white font-semibold text-sm tracking-wide
            shadow-lg shadow-orange-500/30 
            hover:shadow-orange-500/50 hover:scale-100 active:scale-95 
            transition-all duration-300 
            border border-orange-400/50 overflow-hidden"
        >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <Sparkles size={16} className="text-white drop-shadow-sm animate-pulse" />
            <span className="relative z-10 drop-shadow-sm">Ask AI</span>

            {/* Shimmer effect */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
        </button>
    )
}

export default AiButton
