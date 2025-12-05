import React from "react";
import { Bot, User } from "lucide-react";
import { ChatMessage } from "./types";

// Very small Markdown-ish parser for safe, formatted AI messages.
// We intentionally keep this tiny to avoid bringing in external deps.
function escapeHtml(unsafe: string) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatInline(text: string) {
    // bold **text**
    text = text.replace(/\*\*(.+?)\*\*/g, (_, a) => `<strong class=\"text-slate-800 font-semibold\">${a}</strong>`);
    // inline code `code`
    text = text.replace(/`([^`]+)`/g, (_, a) => `<code class=\"px-1 py-0.5 bg-slate-100 rounded text-xs font-mono\">${a}</code>`);
    // links [text](url)
    text = text.replace(/\[(.+?)\]\((https?:\/\/[^)\s]+)\)/g, (_, a, b) => `<a href=\"${b}\" target=\"_blank\" rel=\"noreferrer noopener\" class=\"text-sky-600 underline\">${a}</a>`);
    return text;
}

function formatMessageContent(content: string) {
    if (!content || !content.trim()) return "";
    const lines = content.replace(/\r\n/g, "\n").split("\n");

    let out = "";
    let inList = false;
    let inOrdered = false;
    let inCodeBlock = false;

    for (let rawLine of lines) {
        const line = rawLine.trimEnd();
        // handle code fences
        if (line.startsWith("```") || line.startsWith("~~~")) {
            if (!inCodeBlock) {
                inCodeBlock = true;
                out += '<pre class="bg-slate-900 text-white p-3 rounded-md text-xs overflow-auto font-mono">';
            } else {
                inCodeBlock = false;
                out += "</pre>";
            }
            continue;
        }
        if (inCodeBlock) {
            out += escapeHtml(line) + "\n";
            continue;
        }

        // headings
        if (/^#{1,3}\s+/.test(line)) {
            const m = line.match(/^(#{1,3})\s+(.*)$/);
            if (m) {
                const lvl = m[1].length;
                const text = escapeHtml(m[2]);
                const cls = lvl === 1 ? "text-lg font-semibold text-slate-800" : (lvl === 2 ? "text-sm font-semibold text-slate-700" : "text-xs font-semibold text-slate-600");
                out += `<div class=\"mb-2 mt-2 text-slate-800\"><span class=\"${cls}\">${formatInline(text)}</span></div>`;
                continue;
            }
        }

        // unordered list
        if (/^[-*]\s+/.test(line)) {
            if (!inList) {
                inList = true;
                out += "<ul class=\"ml-4 mt-1 mb-2 list-disc space-y-1\">";
            }
            const li = line.replace(/^[-*]\s+/, "");
            out += `<li class=\"text-sm text-slate-700\">${formatInline(escapeHtml(li))}</li>`;
            continue;
        }

        // ordered list
        if (/^\d+\.\s+/.test(line)) {
            if (!inOrdered) {
                inOrdered = true;
                out += "<ol class=\"ml-4 mt-1 mb-2 list-decimal space-y-1\">";
            }
            const li = line.replace(/^\d+\.\s+/, "");
            out += `<li class=\"text-sm text-slate-700\">${formatInline(escapeHtml(li))}</li>`;
            continue;
        }

        // close any open lists if we hit a blank or normal line
        if (inList && line.trim() === "") {
            out += "</ul>";
            inList = false;
        }
        if (inOrdered && line.trim() === "") {
            out += "</ol>";
            inOrdered = false;
        }

        if (inList || inOrdered) {
            // continue the list: lines without leading markers treated as single list item continuation
            out += `<li class=\"text-sm text-slate-700\">${formatInline(escapeHtml(line))}</li>`;
            continue;
        }

        // horizontal rule
        if (/^[-_*]{3,}\s*$/.test(line)) {
            out += '<hr class=\"my-3 border-slate-200\"/>';
            continue;
        }

        // normal paragraph
        if (line.trim() === "") {
            out += "<div style=\"height:8px\"></div>"; // small spacer
            continue;
        }

        out += `<p class=\"text-sm text-slate-700 leading-relaxed\">${formatInline(escapeHtml(line))}</p>`;
    }

    if (inList) out += "</ul>";
    if (inOrdered) out += "</ol>";
    if (inCodeBlock) out += "</pre>";

    return out;
}

export interface MessageBubbleProps {
    message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
    const isAssistant = message.role === "assistant";

    return (
        <div className="flex items-start gap-3 w-full">

            {/* Avatar */}
            <div className="flex items-center gap-2 mr-1">
                <div
                    className={`
                        mt-1 flex items-center justify-center rounded-full h-10 w-10 p-2.5
                        border shadow-sm
                        ${isAssistant
                            ? "bg-orange-600/90 text-white"
                            : "bg-black/70 text-white"}
                    `}
                >
                    {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-3 w-3" />}
                </div>
            </div>

            {/* CHAT BUBBLE */}
            <div className="flex-1">
                <div
                    className={`
                        relative max-w-[82%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed 
                        shadow-sm border 
                        ${isAssistant
                            ? "bg-slate-100 border-slate-300 text-slate-800"
                            : "bg-black text-white border-black"}
                    `}
                >
                    {/* Bubble Tail - iPhone Style */}
                    <div
                        className={`
                            absolute top-3 -left-2 h-3 w-3 
                            ${isAssistant ? "bg-slate-100 border-l border-b border-slate-300" : "bg-black"} 
                            rotate-45 rounded-sm
                        `}
                    />

                    <div
                        dangerouslySetInnerHTML={{
                            __html: formatMessageContent(String(message.content || "")),
                        }}
                    />
                </div>
            </div>
        </div>
    );
}


