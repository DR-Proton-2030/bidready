import { NextRequest, NextResponse } from "next/server";

type ChatHistoryEntry = {
  role: "user" | "assistant";
  content: string;
};

type OpenAIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENAI_ASSISTANT_MODEL ?? "gpt-4.1-mini";

const sanitizeForPrompt = (payload: unknown, maxLength = 6000): string => {
  if (!payload) return "";
  try {
    const text = JSON.stringify(payload, (_key, value) => {
      if (typeof value === "number") {
        return Number.isFinite(value) ? Number(value.toFixed(4)) : value;
      }
      return value;
    });

    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}…`;
  } catch {
    return "";
  }
};

const normalizeHistory = (history: unknown): ChatHistoryEntry[] => {
  if (!Array.isArray(history)) return [];
  return history
    .filter((entry): entry is ChatHistoryEntry => {
      return (
        entry &&
        typeof entry === "object" &&
        (entry as ChatHistoryEntry).role &&
        ["user", "assistant"].includes((entry as ChatHistoryEntry).role) &&
        typeof (entry as ChatHistoryEntry).content === "string"
      );
    })
    .slice(-6)
    .map((entry) => ({
      role: entry.role,
      content: entry.content.slice(0, 4000),
    }));
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt: unknown = body?.prompt;
    const detectionContext: unknown = body?.detectionContext;
    const imageName: unknown = body?.imageName;
    const history: unknown = body?.history;

    if (typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY || "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";
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key is not configured." }, { status: 500 });
    }

    const sanitizedContext = sanitizeForPrompt(detectionContext);
    const conversationHistory = normalizeHistory(history);

    const systemMessageParts = [
      "You are BidReady's AI assistant specialised in blueprint detection review.",
      "Summarise detections, flag risks, and propose next steps in a professional tone.",
      "Highlight counts, class breakdowns, calibration insights, and measurement observations when available.",
      "Limit responses to 220 words and prefer structured bullet points for clarity.",
    ];

    if (typeof imageName === "string" && imageName.trim()) {
      systemMessageParts.push(`The current blueprint file is named \"${imageName.trim()}\".`);
    }

    if (sanitizedContext) {
      systemMessageParts.push("You will receive a JSON payload containing detection data for reference.");
    }

    const messages: OpenAIMessage[] = [
      {
        role: "system",
        content: systemMessageParts.join(" "),
      },
      ...conversationHistory.map<OpenAIMessage>((entry) => ({
        role: entry.role,
        content: entry.content,
      })),
    ];

    const trimmedPrompt = prompt.trim();
    const userContent = sanitizedContext
      ? `${trimmedPrompt}\n\nDetection payload (JSON):\n${sanitizedContext}`
      : trimmedPrompt;

    messages.push({
      role: "user",
      content: userContent,
    });

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        temperature: 0.2,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "OpenAI request failed.", details: errorText.slice(0, 500) },
        { status: response.status }
      );
    }

    const data = await response.json();
    const reply: string | undefined = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return NextResponse.json(
        { error: "Empty response from AI." },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[AskAI] Unable to process request", error);
    return NextResponse.json({ error: "Failed to generate AI response." }, { status: 500 });
  }
}
