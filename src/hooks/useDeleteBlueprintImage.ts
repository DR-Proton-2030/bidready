import { useCallback, useState } from "react";

export default function useDeleteBlueprintImage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteImage = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_BLUEPRINTS_API_URL || "http://localhost:8989";
      const res = await fetch(`${base}/blueprints/delete-blueprint-images/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(text || `API error ${res.status}`);
      }
      return true;
    } catch (err: any) {
      setError(err?.message ?? String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteImage, loading, error } as const;
}
