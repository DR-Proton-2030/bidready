import React, { useEffect, useMemo, useState } from "react";
import { X, Send, Loader2 } from "lucide-react";

interface AskAISidePanelProps {
    open: boolean;
    onClose: () => void;
    imageName?: string;
    detectionContext?: unknown;
}

type ChatMessage = {
    id: string;
    role: "user" | "assistant";
    content: string;
};

export default function AskAISidePanel({ open, onClose, imageName, detectionContext }: AskAISidePanelProps) {
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

    const detectionPreview = useMemo(() => {
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
                className="flex-1 bg-black/40"
                aria-label="Close Ask AI panel backdrop"
                onClick={onClose}
            />
            <aside className="relative flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl">
                <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                            Ask AI
                        </p>
                        {imageName && (
                            <p className="mt-1 truncate text-sm text-slate-400">
                                Referencing {imageName}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Close Ask AI panel"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto px-5 py-4">
                    <div className="space-y-4">
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            Describe what you need from the blueprint and we will route it to the AI workspace.
                        </div>

                        {detectionPreview && (
                            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                                    Detection Snapshot
                                </p>
                                <div className="mt-2 space-y-1 text-[13px]">
                                    <p>Total detections: <span className="font-semibold text-slate-800">{detectionPreview.totalPredictions}</span></p>
                                    <p>User annotations: <span className="font-semibold text-slate-800">{detectionPreview.totalUserAnnotations}</span></p>
                                    <p>Measurements stored: <span className="font-semibold text-slate-800">{detectionPreview.totalMeasurements}</span></p>
                                    {detectionPreview.calibration && (
                                        <p className="text-[12px] text-slate-500">
                                            Calibrated at {detectionPreview.calibration.unitsPerPixel?.toFixed?.(4) ?? detectionPreview.calibration.unitsPerPixel} {detectionPreview.calibration.unit}/px
                                        </p>
                                    )}
                                </div>
                                {detectionPreview.classBreakdown.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                            Top classes
                                        </p>
                                        <ul className="mt-1 space-y-1 text-[13px] text-slate-600">
                                            {detectionPreview.classBreakdown.map(([label, value]) => (
                                                <li key={label} className="flex items-center justify-between">
                                                    <span className="truncate pr-2">{label}</span>
                                                    <span className="font-semibold text-slate-800">{value}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-3">
                            {messages.length === 0 && !isLoading && (
                                <p className="rounded-lg border border-dashed border-slate-300 px-4 py-3 text-center text-[13px] text-slate-500">
                                    Start the conversation to get an AI-generated summary or ask targeted questions about this detection set.
                                </p>
                            )}

                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`rounded-lg px-4 py-3 text-sm shadow-sm ${message.role === "assistant" ? "bg-slate-900 text-white" : "bg-sky-50 text-slate-800"}`}
                                >
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                                        {message.role === "assistant" ? "Assistant" : "You"}
                                    </p>
                                    <p className="mt-1 whitespace-pre-line leading-relaxed">
                                        {message.content}
                                    </p>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-500">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Generating response…</span>
                                </div>
                            )}

                            {error && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="border-t border-slate-200 px-5 py-4">
                    <label htmlFor="ask-ai-input" className="sr-only">
                        Ask AI prompt
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            id="ask-ai-input"
                            type="text"
                            value={prompt}
                            onChange={(event) => setPrompt(event.target.value)}
                            placeholder="Ask something about this blueprint..."
                            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                            <Send className="h-4 w-4" />
                            Send
                        </button>
                    </div>
                </form>
            </aside>
        </div>
    );
}
