import { useState, useCallback } from "react";

type DetectionShape = {
  id?: string;
  path: string;
  color?: string;
  area?: number;
  label?: string;
  [key: string]: unknown;
};

type DetectionResult = {
  success: boolean;
  total_detections: number;
  object_counts: Record<string, number>;
  predictions: Array<any>;
  shapes?: DetectionShape[];
  dimension_candidates?: Array<any>;
  dimension_calibration?: Record<string, unknown> | null;
};

export default function useImageDetect() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectImage = useCallback(async (imageUrl: string): Promise<DetectionResult> => {
    if (!imageUrl) throw new Error("No image URL provided");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || process.env.BLUEPRINTS_API_URL || 'http://localhost:8000'}/detect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: imageUrl ,
          selected_labels: "Door,Window,Wall",
  use_tiling: true,
  per_class_conf: {"Wall": 0.1, "Door": 0.4, "Window": 0.32}}),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Detect API error ${res.status} ${text}`);
      }
      const data = await res.json().catch(() => null);

      const normalizeShape = (shape: any, idx: number): DetectionShape | null => {
        if (!shape) return null;
        const path = typeof shape.path === "string" ? shape.path.trim() : null;
        if (!path) return null;

        const normalized: DetectionShape = {
          ...shape,
          id: shape.id ?? `shape-${idx}`,
          path,
        };

        if (typeof shape.color === "string") normalized.color = shape.color;
        if (typeof shape.area === "number") normalized.area = shape.area;
        if (typeof shape.label === "string") normalized.label = shape.label;

        return normalized;
      };

      const rawShapeSource = Array.isArray(data?.shapes)
        ? data.shapes
        : Array.isArray(data?.dimension_candidates)
          ? data.dimension_candidates
          : [];
      const shapes = rawShapeSource
        .map((shape: any, idx: number) => normalizeShape(shape, idx))
        .filter((shape:any): shape is DetectionShape => !!shape);

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
        shapes,
        dimension_candidates: Array.isArray(data?.dimension_candidates) ? data.dimension_candidates : undefined,
        dimension_calibration: data?.dimension_calibration ?? null,
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
