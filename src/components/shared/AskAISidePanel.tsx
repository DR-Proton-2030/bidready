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

    // Generic function to send a prompt and append assistant response with optional actions
    const sendPrompt = async (promptText: string) => {
        const trimmed = promptText.trim();
        if (!trimmed) return;

        const userId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`;
        const userMessage: ChatMessage = { id: userId, role: "user", content: trimmed };
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
            const assistantActions = Array.isArray(data.actions)
                ? data.actions.map((a: any) => ({ id: String(a.id ?? a.label ?? `${Date.now()}`), label: String(a.label ?? a) }))
                : undefined;

            const assistantMessage: ChatMessage = {
                id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-assistant`,
                role: "assistant",
                content: assistantContent,
                actions: assistantActions,
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unexpected error";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    // quickActions: actions from the last assistant message to render in a dedicated area
    const [quickActions, setQuickActions] = useState<Array<{ id: string; label: string }> | null>(null);
    const [actionSourceId, setActionSourceId] = useState<string | null>(null);

    useEffect(() => {
        // find last assistant message that contains actions
        for (let i = messages.length - 1; i >= 0; i--) {
            const m = messages[i];
            if (m.role === "assistant" && Array.isArray(m.actions) && m.actions.length > 0) {
                if (m.id !== actionSourceId) {
                    setQuickActions(m.actions as Array<{ id: string; label: string }>);
                    setActionSourceId(m.id ?? null);
                }
                return;
            }
        }
        setQuickActions(null);
        setActionSourceId(null);
    }, [messages, actionSourceId]);

    // Handler that the MessagesSection will call when the user clicks one of the assistant quick actions
    const handleActionClick = (actionId: string, actionLabel: string) => {
        // Hide current quick actions until the assistant returns a fresh set
        setQuickActions(null);
        // For now, we send the action label to the AI as if a user typed it. This keeps the conversation flow simple.
        sendPrompt(actionLabel);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmed = prompt.trim();
        if (!trimmed) return;
        await sendPrompt(trimmed);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[70] flex ">
            <button
                type="button"
                className="flex-1 bg-slate-900/40  backdrop-blur-xs"
                aria-label="Close Ask AI panel backdrop"
                onClick={onClose}
            />
            <aside className="relative flex h-full w-full max-w-md flex-col overflow-hidden border-l 
             border-slate-200 bg-white text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white via-white/60 to-transparent" />


                <div className="relative flex-1 overflow-y-auto pb-6">
                    <AskAIHeader imageName={imageName} onClose={onClose} />
                    <div className="space-y-5 px-6 pt-4">

                        {/* <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 shadow-inner shadow-white">
                            Describe what you need from the blueprint and Copilot will fuse detection output, annotations, and measurements into a concise answer.
                        </div> */}
                        {/* <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium uppercase tracking-[0.25em] text-slate-500">
                            <span className="rounded-full border border-slate-200 bg-slate-600 px-2.5 py-2 text-slate-100 font-sans">Live insight</span>
                            <span className="rounded-full border border-slate-200 bg-slate-600 px-2.5 py-2 text-slate-100">Detection aware</span>
                        </div> */}
                        <DetectionSnapshot preview={detectionPreview} />

                        <MessagesSection messages={messages} isLoading={isLoading} error={error} onReply={(content) => setPrompt(content)} />
                    </div>
                </div>

                {/* Quick actions area - show assistant suggested next steps in a different container */}
                {quickActions && quickActions.length > 0 && (
                    <div className="border-t border-slate-200 bg-white px-6 py-3">
                        <div className="mb-2 flex items-center justify-between">
                            <div className="text-xs font-semibold text-slate-500">Next steps</div>
                            <button
                                type="button"
                                aria-label="Dismiss suggested next steps"
                                className="text-slate-400 hover:text-slate-600 text-xs"
                                onClick={() => setQuickActions(null)}
                            >
                                Dismiss
                            </button>
                        </div>
                        <div className="flex flex-col gap-2">
                            {quickActions.map((action) => (
                                <button
                                    key={action.id}
                                    type="button"
                                    className="w-full text-left rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                    onClick={() => handleActionClick(action.id, action.label)}
                                    aria-label={`Quick action: ${action.label}`}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

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
