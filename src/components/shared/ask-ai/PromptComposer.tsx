import React from "react";
import { Send } from "lucide-react";

export interface PromptComposerProps {
    prompt: string;
    onPromptChange: (value: string) => void;
    isLoading: boolean;
}

export default function PromptComposer({ prompt, onPromptChange, isLoading }: PromptComposerProps) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-200 px-3 py-2">
            <input
                id="ask-ai-input"
                type="text"
                value={prompt}
                onChange={(event) => onPromptChange(event.target.value)}
                placeholder="Ask something about this blueprint…"
                className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-3 
                text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
                <Send className="h-4 w-4" />
                Send
            </button>
        </div>
    );
}
