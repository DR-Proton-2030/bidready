import React, { useEffect, useMemo, useState } from "react";
import { X, Send, Loader2, Bot, Sparkles, User } from "lucide-react";

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
                className="flex-1 bg-slate-900/20 backdrop-blur-sm"
                aria-label="Close Ask AI panel backdrop"
                onClick={onClose}
            />
            <aside className="relative flex h-full w-full max-w-lg flex-col overflow-hidden border-l border-slate-200 bg-white text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white via-white/60 to-transparent" />

                <header className="relative flex items-start justify-between px-6 py-5">
                    <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-sky-50 p-2 text-sky-500 shadow-inner shadow-sky-200/80">
                            <Bot className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                                BidReady Copilot
                            </p>
                            <p className="text-lg font-semibold text-slate-900">
                                Blueprint Intelligence Desk
                            </p>
                            {imageName && (
                                <p className="mt-0.5 truncate text-sm text-slate-500">
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

                <div className="relative flex-1 overflow-y-auto px-6 pb-6">
                    <div className="space-y-5">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 shadow-inner shadow-white">
                            Describe what you need from the blueprint and Copilot will fuse detection output, annotations, and measurements into a concise answer.
                        </div>

                        {detectionPreview && (
                            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/60">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                                        Detection Snapshot
                                    </p>
                                    <Sparkles className="h-4 w-4 text-sky-500" />
                                </div>
                                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                                    {[
                                        { label: "Detections", value: detectionPreview.totalPredictions },
                                        { label: "Annotations", value: detectionPreview.totalUserAnnotations },
                                        { label: "Measurements", value: detectionPreview.totalMeasurements },
                                    ].map((stat) => (
                                        <div key={stat.label} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                                            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">{stat.label}</p>
                                            <p className="mt-1 text-2xl font-semibold text-slate-900">{stat.value}</p>
                                        </div>
                                    ))}
                                </div>
                                {detectionPreview.calibration && (
                                    <p className="mt-3 text-xs text-slate-500">
                                        Calibrated scale: <span className="text-slate-900">{detectionPreview.calibration.unitsPerPixel?.toFixed?.(4) ?? detectionPreview.calibration.unitsPerPixel} {detectionPreview.calibration.unit}/px</span>
                                    </p>
                                )}
                                {detectionPreview.classBreakdown.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                                            Top classes
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {detectionPreview.classBreakdown.map(([label, value]) => (
                                                <span
                                                    key={label}
                                                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600"
                                                >
                                                    <span className="truncate max-w-[120px]">{label}</span>
                                                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] text-sky-700">{value}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}

                        <section className="space-y-3">
                            {messages.length === 0 && !isLoading && (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-center text-sm text-slate-500">
                                    Ask for a summary, risk scan, or material take-off hint. Copilot stays scoped to this blueprint and its detections.
                                </div>
                            )}

                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-lg shadow-slate-200/80 ${message.role === "assistant" ? "border-sky-200 bg-gradient-to-br from-sky-50 to-white text-slate-800" : "border-slate-200 bg-white text-slate-600"}`}
                                >
                                    <div className={`mt-0.5 rounded-full p-1 ${message.role === "assistant" ? "bg-sky-100 text-sky-600" : "bg-slate-100 text-slate-500"}`}>
                                        {message.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                                            {message.role === "assistant" ? "Assistant" : "You"}
                                        </p>
                                        <p className="mt-1 whitespace-pre-line leading-relaxed">
                                            {message.content}
                                        </p>
                                    </div>
                                </div>
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
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white px-6 py-4">
                    <label htmlFor="ask-ai-input" className="sr-only">
                        Ask AI prompt
                    </label>
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <input
                            id="ask-ai-input"
                            type="text"
                            value={prompt}
                            onChange={(event) => setPrompt(event.target.value)}
                            placeholder="Ask something about this blueprint…"
                            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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
