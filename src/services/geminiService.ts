
import { AIAnalysisResult } from "../types/gemini";

//services

export type BlueprintRegionDetection = {
  label: string;
  box: [number, number, number, number];
};

export const analyzeFloorPlan = async (base64Image: string): Promise<AIAnalysisResult> => {
  try {
    const res = await fetch("/api/gemini/deep-scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageDataUrl: base64Image }),
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      throw new Error(errorBody?.error || "Deep scan request failed.");
    }

    return (await res.json()) as AIAnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error((error as Error).message || "Failed deep AI scan. Please try a clearer image or check your API limit.");
  }
};

export const detectRoomsAndCorridors = async (
  base64Image: string,
  detectionQuery = "rooms, corridors",
): Promise<BlueprintRegionDetection[]> => {
  try {
    const res = await fetch("/api/gemini/room-corridor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageDataUrl: base64Image, detectionQuery }),
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      throw new Error(errorBody?.error || "Room/corridor detection failed.");
    }

    const parsed = (await res.json()) as BlueprintRegionDetection[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Gemini Detection Error:", error);
    throw new Error(
      (error as Error).message ||
        "Failed to run room/corridor detection. Please try again.",
    );
  }
};
