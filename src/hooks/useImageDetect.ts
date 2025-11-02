import { useState, useCallback } from "react";

type DetectionResult = {
  success: boolean;
  total_detections: number;
  object_counts: Record<string, number>;
  predictions: Array<any>;
};

export default function useImageDetect() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectImage = useCallback(async (imageUrl: string): Promise<DetectionResult> => {
    if (!imageUrl) throw new Error("No image URL provided");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: imageUrl }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Detect API error ${res.status} ${text}`);
      }
      const data = await res.json().catch(() => null);

      const predictions = (data?.detections || []).map((d: any, idx: number) => {
        const x1 = Number(d?.bbox?.x1 ?? 0);
        const y1 = Number(d?.bbox?.y1 ?? 0);
        const x2 = Number(d?.bbox?.x2 ?? 0);
        const y2 = Number(d?.bbox?.y2 ?? 0);
        const width = Math.max(0, x2 - x1);
        const height = Math.max(0, y2 - y1);
        const cx = x1 + width / 2;
        const cy = y1 + height / 2;
        return {
          id: d.id ?? `pred-${idx}`,
          class: d.label ?? d?.label_name ?? "Unknown",
          confidence: d.confidence ?? d.score ?? 0,
          x: cx,
          y: cy,
          width,
          height,
        };
      });

      const transformed: DetectionResult = {
        success: data?.success ?? true,
        total_detections: data?.total_detections ?? predictions.length,
        object_counts: data?.object_counts ?? {},
        predictions,
      };

      return transformed;
    } catch (err: any) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { detectImage, loading, error } as const;
}
