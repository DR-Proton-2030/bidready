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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toFiniteNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const truncateText = (text: string, maxLength: number) =>
  text.length <= maxLength ? text : `${text.slice(0, maxLength)}…`;

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

const buildDetectionBrief = (context: unknown, maxLength = 1800): string => {
  if (!isRecord(context)) return "";

  const ctx = context as Record<string, unknown>;
  const stats = isRecord(ctx.stats) ? (ctx.stats as Record<string, unknown>) : undefined;
  const predictions = Array.isArray(ctx.predictions) ? ctx.predictions : [];
  const shapes = Array.isArray(ctx.dimensionShapes) ? ctx.dimensionShapes : [];
  const annotations = Array.isArray(ctx.userAnnotations) ? ctx.userAnnotations : [];
  const measurements = Array.isArray(ctx.measurements) ? ctx.measurements : [];

  const totalDetections =
    toFiniteNumber(stats?.totalPredictions) ?? (predictions.length ? predictions.length : undefined);
  const totalAnnotations =
    toFiniteNumber(stats?.totalUserAnnotations) ?? (annotations.length ? annotations.length : undefined);
  const totalMeasurements =
    toFiniteNumber(stats?.totalMeasurements) ?? (measurements.length ? measurements.length : undefined);

  const lines: string[] = [];

  if (
    typeof totalDetections === "number" ||
    typeof totalAnnotations === "number" ||
    typeof totalMeasurements === "number"
  ) {
    lines.push(
      `Overall counts → detections: ${totalDetections ?? "n/a"}, annotations: ${
        totalAnnotations ?? "n/a"
      }, measurements: ${totalMeasurements ?? "n/a"}.`
    );
  }

  const classBreakdown = stats && isRecord(stats.classBreakdown)
    ? (stats.classBreakdown as Record<string, unknown>)
    : undefined;
  if (classBreakdown) {
    const sorted = Object.entries(classBreakdown)
      .filter(([, count]) => typeof count === "number" && count > 0)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 6)
      .map(([label, count]) => {
        const percent =
          typeof totalDetections === "number" && totalDetections > 0
            ? ` (${(((count as number) / totalDetections) * 100).toFixed(1)}%)`
            : "";
        return `${label}: ${count}${percent}`;
      });
    if (sorted.length) {
      lines.push(`Top classes → ${sorted.join(", ")}.`);
    }
  }

  if (predictions.length) {
    const confidences = predictions
      .map((prediction) => (isRecord(prediction) ? toFiniteNumber(prediction.confidence) : undefined))
      .filter((value): value is number => typeof value === "number");
    if (confidences.length) {
      const avgConfidence =
        confidences.reduce((sum, confidence) => sum + confidence, 0) / confidences.length;
      lines.push(`Average AI confidence: ${(avgConfidence * 100).toFixed(1)}%.`);
    }

    const samples = predictions
      .slice(0, 4)
      .map((prediction) => {
        if (!isRecord(prediction)) return "";
        const label = typeof prediction.label === "string" ? prediction.label : "item";
        const confidence = toFiniteNumber(prediction.confidence);
        const source = typeof prediction.source === "string" ? prediction.source : undefined;
        const confidenceText = confidence ? `${(confidence * 100).toFixed(0)}%` : "";
        return `${label}${confidenceText ? ` (${confidenceText})` : ""}${source ? ` · ${source}` : ""}`;
      })
      .filter(Boolean);

    if (samples.length) {
      lines.push(`Sample detections → ${samples.join(", ")}.`);
    }
  }

  if (shapes.length) {
    const shapeSummary = shapes
      .slice(0, 3)
      .map((shape) => {
        if (!isRecord(shape)) return "shape";
        const type = typeof shape.type === "string" ? shape.type : "shape";
        const area = toFiniteNumber(shape.area);
        return area ? `${type} area ${area}` : type;
      });
    lines.push(
      `Dimension shapes captured (${shapes.length} total) → ${shapeSummary.join(", ")}. Values are raw drawing units unless calibration is provided.`
    );
  }

  if (annotations.length) {
    const annotationLabels = annotations
      .map((annotation) => (isRecord(annotation) && typeof annotation.label === "string" ? annotation.label : null))
      .filter((label): label is string => Boolean(label))
      .slice(0, 5);

    lines.push(
      `User annotations (${annotations.length}) → ${annotationLabels.length ? annotationLabels.join(", ") : "labels not provided"}.`
    );
  }

  if (measurements.length) {
    lines.push(`Measurements stored: ${measurements.length}.`);
  }

  if (isRecord(ctx.calibration)) {
    const calibration = ctx.calibration as Record<string, unknown>;
    const scale = toFiniteNumber(calibration.scale);
    const ref = toFiniteNumber(calibration.referenceLength ?? calibration.reference);
    const units =
      typeof calibration.units === "string"
        ? calibration.units
        : typeof calibration.unit === "string"
        ? calibration.unit
        : undefined;

    const calibrationParts = [];
    if (scale) calibrationParts.push(`scale ${scale}`);
    if (ref) calibrationParts.push(`ref length ${ref}`);
    if (units) calibrationParts.push(`units ${units}`);
    lines.push(
      calibrationParts.length
        ? `Calibration metadata detected → ${calibrationParts.join(", ")}.`
        : "Calibration metadata detected (fields unspecified)."
    );
  }

  if (!lines.length) return "";
  return truncateText(lines.join("\n"), maxLength);
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

const extractNextStepActions = (reply: string, maxActions = 6): Array<{ id: string; label: string }> => {
  if (typeof reply !== "string" || !reply.trim()) return [];

  const markerMatch = /next step[s]?/i.exec(reply);
  if (!markerMatch) return [];
  const markerIndex = markerMatch.index;

  const tail = reply.slice(markerIndex).split(/\r?\n/);
  const actions: string[] = [];

  for (let i = 1; i < tail.length; i++) {
    const line = tail[i].trim();
    if (!line) {
      if (actions.length) break;
      continue;
    }

    // stop if a new heading/section starts after we've collected actions
    if (actions.length && /[:：]$/.test(line)) break;
    if (/^[A-Z][^a-z]{0,}$/u.test(line) && actions.length) break; // uppercase heading

    const bulletMatch = line.match(/^[-*]\s+(.*)$/) || line.match(/^\d+\.\s+(.*)$/);
    if (bulletMatch) {
      const label = bulletMatch[1]?.trim();
      if (label) actions.push(label.replace(/[*_`]/g, ""));
    } else if (actions.length) {
      break;
    }

    if (actions.length >= maxActions) break;
  }

  return actions.map((label, idx) => ({
    id: `next-step-${idx}`,
    label,
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
    const structuredContext = buildDetectionBrief(detectionContext);
    const conversationHistory = normalizeHistory(history);

    const systemMessageParts = [
      "You are BidReady Copilot, a senior construction estimator and building-science analyst.",
      "Use the detection context to answer questions about the current blueprint: quantify trades, recommend scopes of work, flag data risks, and outline next actions.",
      "Always explain calculations (counts, ratios, take-off assumptions) so the user can follow the math.",
        "Limit responses to ~220 words, favour short sections or bullets, and explicitly note any missing data or assumptions.",
        "When surfacing recommendations or follow-up tasks, include a heading exactly named 'NEXT STEP' followed by a short bullet or numbered list so the client UI can reliably parse them.",
    ];

    if (typeof imageName === "string" && imageName.trim()) {
      systemMessageParts.push(`The current blueprint file is named \"${imageName.trim()}\".`);
    }

    if (structuredContext || sanitizedContext) {
      systemMessageParts.push("A structured detection summary and raw JSON payload will follow with each user prompt.");
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
    const contextBlocks: string[] = [];
    if (structuredContext) {
      contextBlocks.push(`Structured detection recap:\n${structuredContext}`);
    }
    if (sanitizedContext) {
      contextBlocks.push(`Raw detection payload (JSON):\n${sanitizedContext}`);
    }

    const userContent = contextBlocks.length
      ? `${trimmedPrompt}\n\n${contextBlocks.join("\n\n")}`
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

    const actions = extractNextStepActions(reply);

    return NextResponse.json({ reply, actions });
  } catch (error) {
    console.error("[AskAI] Unable to process request", error);
    return NextResponse.json({ error: "Failed to generate AI response." }, { status: 500 });
  }
}
