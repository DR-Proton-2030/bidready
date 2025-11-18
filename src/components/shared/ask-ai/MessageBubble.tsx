import React from "react";
import { Bot, User } from "lucide-react";
import { ChatMessage } from "./types";

export interface MessageBubbleProps {
    message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
    return (
        <div
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-lg shadow-slate-200/80 ${message.role === "assistant" ? "border-sky-200 bg-gradient-to-br from-sky-50 to-white text-slate-800" : "border-slate-200 bg-white text-slate-600"}`}
        >
            <div className={`mt-0.5 rounded-full p-1 ${message.role === "assistant" ? "bg-sky-100 text-sky-600" : "bg-slate-100 text-slate-500"}`}>
                {message.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>
            <div className="flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                    {message.role === "assistant" ? "Assistant" : "You"}
                </p>
                <p className="mt-1 whitespace-pre-line leading-relaxed">{message.content}</p>
            </div>
        </div>
    );
}
