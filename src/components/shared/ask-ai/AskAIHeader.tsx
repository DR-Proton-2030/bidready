import React from "react";
import { Bot, X } from "lucide-react";

export interface AskAIHeaderProps {
    imageName?: string;
    onClose: () => void;
}

export default function AskAIHeader({ imageName, onClose }: AskAIHeaderProps) {
    return (
        <header className="relative flex items-start justify-between px-6 py-2 z-10 bg-gradient-to-br from-orange-600/5 to-white/80 backdrop-blur-sm">
            <div className="flex items-start gap-3 pt-3">
                {/* <div className="rounded-2xl bg-orange-500 p-2 text-white -500 shadow-inner shadow-sky-200/80">
                    <Bot className="h-5 w-5" />
                </div> */}
                <div className="min-w-0">
                    <div className="space-y-2">
                        {/* <img className='w-96' src={newleeyBlueBrandLogo} alt="" /> */}
                        <h1 className="relative inline-block text-3xl md:text-5xl lg:text-4xl font-extrabold leading-tight 
                        tracking-tight bg-gradient-to-r from-[#FF6A00] via-[#FF8C00] to-[#FFC300]
 bg-clip-text text-transparent">
                            Bidready Copilot

                            <span className="absolute left-0 bottom-1 h-2 md:h-2 w-full bg-gradient-to-r from-blue-100 to-indigo-50 rounded-md blur-sm"></span>
                        </h1>
                        <h2 className="text-xl md:text-2xl w-[80%] font-semibold tracking-tight bg-gradient-to-r from-black/80 via-black/60 to-black/50 bg-clip-text text-transparent">
                            AI Assistant for all your Quesries about Blueprint
                        </h2>
                    </div>
                    {/* {imageName && (
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                            Currently reviewing <span className="text-slate-900">{imageName}</span>
                        </p>
                    )} */}

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
