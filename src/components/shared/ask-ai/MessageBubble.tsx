import React from "react";
import { Bot, User, Copy, MessageSquare } from "lucide-react";
import { ChatMessage } from "./types";

function renderMessageContent(content: string) {
    if (!content || !content.trim()) {
        return [
            <p key="empty" className="text-sm text-slate-500 italic">
                No content provided.
            </p>,
        ];
    }

    const lines = content.replace(/\r\n/g, "\n").split("\n");
    const rendered: React.ReactNode[] = [];

    let listBuffer: { type: "ul" | "ol"; items: string[] } | null = null;
    let codeBuffer: string[] | null = null;

    const flushList = (key: string) => {
        if (!listBuffer) return;
        if (listBuffer.type === "ul") {
            rendered.push(
                <ul key={key} className="ml-4 mt-1 mb-2 list-disc space-y-1 text-sm text-slate-700">
                    {listBuffer.items.map((item, idx) => (
                        <li key={`${key}-ul-${idx}`}>{item}</li>
                    ))}
                </ul>
            );
        } else {
            rendered.push(
                <ol key={key} className="ml-4 mt-1 mb-2 list-decimal space-y-1 text-sm text-slate-700">
                    {listBuffer.items.map((item, idx) => (
                        <li key={`${key}-ol-${idx}`}>{item}</li>
                    ))}
                </ol>
            );
        }
        listBuffer = null;
    };

    const flushCodeBlock = (key: string) => {
        if (!codeBuffer) return;
        rendered.push(
            <pre key={key} className="bg-slate-200 text-slate-900 p-3 rounded-md text-xs overflow-auto font-mono">
                <code>{codeBuffer.join("\n")}</code>
            </pre>
        );
        codeBuffer = null;
    };

    lines.forEach((rawLine, idx) => {
        const trimmed = rawLine.trim();
        const codeFence = rawLine.trim().startsWith("```") || rawLine.trim().startsWith("~~~");

        if (codeFence) {
            if (!codeBuffer) {
                flushList(`list-before-code-${idx}`);
                codeBuffer = [];
            } else {
                flushCodeBlock(`code-${idx}`);
            }
            return;
        }

        if (codeBuffer) {
            codeBuffer.push(rawLine);
            return;
        }

        if (!trimmed) {
            flushList(`list-break-${idx}`);
            rendered.push(<div key={`spacer-${idx}`} className="h-2" />);
            return;
        }

        if (/^[-*]\s+/.test(trimmed)) {
            if (!listBuffer || listBuffer.type !== "ul") {
                flushList(`list-switch-${idx}`);
                listBuffer = { type: "ul", items: [] };
            }
            listBuffer.items.push(trimmed.replace(/^[-*]\s+/, ""));
            return;
        }

        if (/^\d+\.\s+/.test(trimmed)) {
            if (!listBuffer || listBuffer.type !== "ol") {
                flushList(`list-switch-${idx}`);
                listBuffer = { type: "ol", items: [] };
            }
            listBuffer.items.push(trimmed.replace(/^\d+\.\s+/, ""));
            return;
        }

        if (/^#{1,3}\s+/.test(trimmed)) {
            flushList(`list-heading-${idx}`);
            const level = trimmed.match(/^(#{1,3})/)?.[0].length ?? 1;
            const text = trimmed.replace(/^#{1,3}\s+/, "");
            const headingClass =
                level === 1
                    ? "text-lg font-semibold text-slate-800"
                    : level === 2
                        ? "text-sm font-semibold text-slate-700"
                        : "text-xs font-semibold text-slate-600";
            rendered.push(
                <div key={`heading-${idx}`} className="mb-2 mt-2 text-slate-800">
                    <span className={headingClass}>{text}</span>
                </div>
            );
            return;
        }

        if (/^[-_*]{3,}\s*$/.test(trimmed)) {
            flushList(`list-hr-${idx}`);
            rendered.push(<hr key={`hr-${idx}`} className="my-3 border-slate-200" />);
            return;
        }

        flushList(`list-paragraph-${idx}`);
        rendered.push(
            <p key={`paragraph-${idx}`} className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {trimmed}
            </p>
        );
    });

    flushList("list-end");
    flushCodeBlock("code-end");

    return rendered;
}

export interface MessageBubbleProps {
    message: ChatMessage;
    onReply?: (content: string) => void;
}

export default function MessageBubble({ message, onReply }: MessageBubbleProps) {
    const isAssistant = message.role === "assistant";
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content || "");
        } catch (err) {
            // ignore clipboard errors
        }
    };

    return (
        <div className={`flex items-start gap-3 w-full group ${isAssistant ? "" : "flex-row-reverse"}`} role="article" aria-label={isAssistant ? "Assistant message" : "User message"}>

            {/* Avatar */}
            <div className={`flex items-center gap-2 ${isAssistant ? "mr-1" : "ml-1"}`}>
                <div
                    className={`
                        mt-1 flex items-center justify-center rounded-full h-10 w-10 p-2.5
                        border shadow-sm
                        ${isAssistant
                            ? "bg-orange-600/90 text-white"
                            : "bg-slate-200 text-slate-800"}
                    `}
                >
                    {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-3 w-3" />}
                </div>
            </div>

            {/* CHAT BUBBLE */}
            <div className={`flex-1 flex ${isAssistant ? "justify-start" : "justify-end"}`}>
                <div
                    className={`
                        relative max-w- px-4 py-3 rounded-2xl text-[14px] leading-relaxed 
                        shadow-sm border transition-transform group-hover:translate-y-[-1px]
                        ${isAssistant
                            ? "bg-slate-50 border-slate-200 text-slate-800 text-left"
                            : "bg-slate-200 border-slate-300 text-slate-900 text-left"}
                    `}
                >
                    {/* Bubble Tail - iPhone Style */}
                    <div
                        className={`
                            absolute top-3 ${isAssistant ? '-left-2' : '-right-2'} h-3 w-3
                            ${isAssistant ? 'bg-slate-50 border-l border-b border-slate-200' : 'bg-slate-200 border-r border-b border-slate-300'}
                            rotate-45 rounded-sm
                        `}
                    />

                    <div className="min-h-[24px] text-sm leading-relaxed space-y-1">
                        {renderMessageContent(String(message.content || ""))}
                    </div>

                    {/* Inline controls */}
                    {/* <div
                        className={`
                            absolute top-2 hidden items-center gap-2 group-hover:flex
                            ${isAssistant ? "right-2" : "left-2 flex-row-reverse"}
                        `}
                    >
                        <button
                            type="button"
                            className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                            aria-label="Copy message"
                            onClick={handleCopy}
                        >
                            <Copy className="h-3 w-3" />
                        </button>
                        <button
                            type="button"
                            className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                            aria-label="Reply to message"
                            onClick={() => onReply?.(message.content ?? "")}
                        >
                            <MessageSquare className="h-3 w-3" />
                        </button>
                    </div> */}
                </div>
            </div>
        </div>
    );
}


