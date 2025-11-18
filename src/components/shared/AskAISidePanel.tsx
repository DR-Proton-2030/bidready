import React, { useEffect, useMemo, useState } from "react";
import AskAIHeader from "./ask-ai/AskAIHeader";
import DetectionSnapshot from "./ask-ai/DetectionSnapshot";
import MessagesSection from "./ask-ai/MessagesSection";
import PromptComposer from "./ask-ai/PromptComposer";
import { ChatMessage, DetectionPreview } from "./ask-ai/types";

interface AskAISidePanelProps {
    open: boolean;
    onClose: () => void;
    imageName?: string;
    detectionContext?: unknown;
}

export default function AskAISidePanel({ open, onClose, imageName, detectionContext }: AskAISidePanelProps) {
    console.log("====>detection ", detectionContext)
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            setPrompt("");
            setMessages([]);
            setIsLoading(false);
            setError(null);
        }
    }, [open]);

    const detectionPreview = useMemo<DetectionPreview | null>(() => {
        if (!detectionContext || typeof detectionContext !== "object" || detectionContext === null) {
            return null;
        }

        const ctx = detectionContext as Record<string, any>;
        const stats = ctx.stats as Record<string, any> | undefined;
        const classBreakdown = (stats?.classBreakdown ?? {}) as Record<string, number>;

        return {
            totalPredictions: stats?.totalPredictions ?? 0,
            totalUserAnnotations: stats?.totalUserAnnotations ?? 0,
            totalMeasurements: stats?.totalMeasurements ?? 0,
            calibration: ctx.calibration ?? null,
            classBreakdown: Object.entries(classBreakdown)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6),
        };
    }, [detectionContext]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmed = prompt.trim();
        if (!trimmed) return;

        const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`;
        const userMessage: ChatMessage = {
            id,
            role: "user",
            content: trimmed,
        };

        const nextMessages = [...messages, userMessage];
        setMessages(nextMessages);
        setPrompt("");
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/ask-ai", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt: trimmed,
                    detectionContext,
                    imageName,
                    history: nextMessages.map(({ role, content }) => ({ role, content })),
                }),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || "Failed to contact AI service");
            }

            const data = await response.json();
            const assistantContent = typeof data.reply === "string" && data.reply.trim()
                ? data.reply.trim()
                : "I could not generate a response. Please try again.";

            const assistantMessage: ChatMessage = {
                id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-assistant`,
                role: "assistant",
                content: assistantContent,
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unexpected error";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[70] flex">
            <button
                type="button"
                className="flex-1 bg-slate-900/40  backdrop-blur-xs"
                aria-label="Close Ask AI panel backdrop"
                onClick={onClose}
            />
            <aside className="relative flex h-full w-full max-w-lg flex-col overflow-hidden border-l
             border-slate-200 bg-white text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white via-white/60 to-transparent" />

                <AskAIHeader imageName={imageName} onClose={onClose} />

                <div className="relative flex-1 overflow-y-auto px-6 pb-6">
                    <div className="space-y-5">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 shadow-inner shadow-white">
                            Describe what you need from the blueprint and Copilot will fuse detection output, annotations, and measurements into a concise answer.
                        </div>

                        <DetectionSnapshot preview={detectionPreview} />

                        <MessagesSection messages={messages} isLoading={isLoading} error={error} />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white px-6 py-4">
                    <label htmlFor="ask-ai-input" className="sr-only">
                        Ask AI prompt
                    </label>
                    <PromptComposer prompt={prompt} onPromptChange={setPrompt} isLoading={isLoading} />
                </form>
            </aside>
        </div>
    );
}
