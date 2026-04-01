import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
type BlueprintRegionDetection = {
  label: string;
  box: [number, number, number, number];
};

const defaultQuery = "rooms, corridors";

const buildImagePayload = (imageDataUrl: string) => {
  const parts = imageDataUrl.split(",");
  if (parts.length < 2) {
    throw new Error("Invalid image data URL.");
  }

  const mimeType = imageDataUrl.match(/data:(.*?);/)?.[1] || "image/jpeg";
  return { mimeType, data: parts[1] };
};

export async function POST(request: Request) {
  try {
    const { imageDataUrl, detectionQuery } = (await request.json()) as {
      imageDataUrl?: string;
      detectionQuery?: string;
    };

    if (!imageDataUrl) {
      return NextResponse.json(
        { error: "Missing imageDataUrl." },
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY on server." },
        { status: 500 },
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const imagePayload = buildImagePayload(imageDataUrl);
    const query = detectionQuery?.trim() || defaultQuery;

    const prompt = `Analyze this floor plan/blueprint and exhaustively detect ALL instances of the following elements: ${query}.

CRITICAL INSTRUCTIONS FOR BOUNDING BOXES:
1. EXHAUSTIVE DETECTION: You must find and bound EVERY SINGLE instance of the requested elements. Do not skip any rooms.
2. ZERO OVERLAP: Rooms and corridors are distinct physical spaces. A room's bounding box MUST NOT overlap with a corridor's bounding box. Stop the room's box exactly at the wall or door line that separates it from the corridor.
3. WALL-TO-WALL SNAPPING: Use the solid lines (walls) as your absolute boundaries. The box must span exactly from the inner edge of one wall to the inner edge of the opposite wall.
4. INDIVIDUAL SPACES: Each distinct room (e.g., each individual hotel suite, studio, stairwell, elevator lobby, or storage room) must have its own separate bounding box. Do not group multiple rooms into one box.
5. FULL ENCLOSURE: The box must cover the entire floor space of that specific room, not just the text label.
6. PRECISION: Coordinates must be highly accurate, normalized to 0-1000 (ymin, xmin, ymax, xmax).

Return a JSON array of objects. Each object must have:
- "label": string (the name of the detected object, e.g., "rooms", "corridors")
- "box": [ymin, xmin, ymax, xmax] (bounding box coordinates normalized to 0-1000, where ymin is top, xmin is left, ymax is bottom, xmax is right)

Only return the JSON array, nothing else.`;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: imagePayload,
        },
        { text: prompt },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              box: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
                description: "[ymin, xmin, ymax, xmax] normalized to 0-1000",
              },
            },
            required: ["label", "box"],
          },
        },
      },
    });

    const text = result.text;
    if (!text) {
      return NextResponse.json(
        { error: "No response from Gemini." },
        { status: 502 },
      );
    }

    const parsed = JSON.parse(text) as BlueprintRegionDetection[];
    return NextResponse.json(Array.isArray(parsed) ? parsed : []);
  } catch (error) {
    console.error("Gemini detection error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Detection failed." },
      { status: 500 },
    );
  }
}
