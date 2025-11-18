import React from "react";
import { Loader2 } from "lucide-react";
import { ChatMessage } from "./types";
import MessageBubble from "./MessageBubble";

export interface MessagesSectionProps {
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;
}

export default function MessagesSection({ messages, isLoading, error }: MessagesSectionProps) {
    return (
        <section className="space-y-3">
            {messages.length === 0 && !isLoading && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-center text-sm text-slate-500">
                    Ask for a summary, risk scan, or material take-off hint. Copilot stays scoped to this blueprint and its detections.
                </div>
            )}

            {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
            ))}

            {isLoading && (
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
                    <span>Generating response…</span>
                </div>
            )}

            {error && (
                <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}
        </section>
    );
}
