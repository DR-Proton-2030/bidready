import React from "react";
import { ArrowRight } from "lucide-react";

interface HeroHeaderProps {
    readableDate: string;
}

const HeroHeader: React.FC<HeroHeaderProps> = ({ readableDate }) => (
    <header className="relative overflow-hidden rounded-[32px] bg-[#6366F1] p-6 md:p-8 text-white hadow-xl">
        {/* Decorative Stars/Sparkles Background */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
            <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 text-white" viewBox="0 0 100 100">
                <path d="M50 0 L55 45 L100 50 L55 55 L50 100 L45 55 L0 50 L45 45 Z" fill="currentColor" />
            </svg>
            <svg className="absolute right-6 top-6 w-16 h-16 text-white/80" viewBox="0 0 100 100">
                <path d="M50 0 L55 45 L100 50 L55 55 L50 100 L45 55 L0 50 L45 45 Z" fill="currentColor" />
            </svg>
            <svg className="absolute left-8 top-10 w-10 h-10 text-white/50" viewBox="0 0 100 100">
                <path d="M50 0 L55 45 L100 50 L55 55 L50 100 L45 55 L0 50 L45 45 Z" fill="currentColor" />
            </svg>
            <svg className="absolute left-1/4 bottom-6 w-20 h-20 text-white/40" viewBox="0 0 100 100">
                <path d="M50 0 L55 45 L100 50 L55 55 L50 100 L45 55 L0 50 L45 45 Z" fill="currentColor" />
            </svg>
            <svg className="absolute right-1/3 bottom-10 w-12 h-12 text-white/60" viewBox="0 0 100 100">
                <path d="M50 0 L55 45 L100 50 L55 55 L50 100 L45 55 L0 50 L45 45 Z" fill="currentColor" />
            </svg>
            <svg className="absolute left-12 bottom-2 w-8 h-8 text-white/70" viewBox="0 0 100 100">
                <path d="M50 0 L55 45 L100 50 L55 55 L50 100 L45 55 L0 50 L45 45 Z" fill="currentColor" />
            </svg>
        </div>

        <div className="relative z-10 flex flex-col gap-6">
            <div className="max-w-xl space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">Online Course</p>
                <h2 className="text-3xl font-bold leading-tight md:text-4xl tracking-tight">
                    Sharpen Your Skills with Professional Online Courses
                </h2>
            </div>
            
            <div className="flex items-center">
                <button className="group flex items-center gap-2.5 rounded-full bg-black py-2.5 pl-5 pr-2.5 text-xs font-bold text-white transition-all hover:bg-black/80 hover:scale-105 active:scale-95 shadow-md">
                    Join Now
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black">
                        <ArrowRight size={14} strokeWidth={3} />
                    </div>
                </button>
            </div>
        </div>
    </header>
);

export default HeroHeader;
