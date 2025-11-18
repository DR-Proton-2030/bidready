import React from "react";
import { Bot, X } from "lucide-react";

export interface AskAIHeaderProps {
    imageName?: string;
    onClose: () => void;
}

export default function AskAIHeader({ imageName, onClose }: AskAIHeaderProps) {
    return (
        <header className="relative flex items-start justify-between px-6 py-5">
            <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-sky-50 p-2 text-sky-500 shadow-inner shadow-sky-200/80">
                    <Bot className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-xl font-semibold uppercase text-slate-500">BidReady Copilot</p>
                    {imageName && (
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                            Currently reviewing <span className="text-slate-900">{imageName}</span>
                        </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium uppercase tracking-[0.25em] text-slate-500">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600">Live insight</span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600">Detection aware</span>
                    </div>
                </div>
            </div>
            <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-slate-200 bg-white/70 p-1.5 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-800"
                aria-label="Close Ask AI panel"
            >
                <X className="h-4 w-4" />
            </button>
        </header>
    );
}
