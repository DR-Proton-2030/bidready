import { useCallback, useEffect, useState } from "react";

export interface BlueprintImage {
  id: string;
  url?: string | null;
}

const resolveIdFromWindow = (propId?: string | null): string | null => {
  if (propId) return propId;
  if (typeof window === "undefined") return null;
  const path = window.location.pathname || "";
  const m = path.match(/\/blueprint_detection\/([^\/\?]+)/);
  return m ? m[1] : null;
};

export default function useBlueprintImages(propId?: string | null, versionId?: string | null) {
  const [images, setImages] = useState<BlueprintImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(
    async (overrideId?: string | null) => {
      const id = overrideId ?? resolveIdFromWindow(propId);
      if (!id) {
        setError("No blueprint id found in route or props");
        setImages([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_BLUEPRINTS_API_URL || "http://localhost:8989";
        let url = `${base}/blueprints/get-blueprint-images/${encodeURIComponent(id)}`;
        if (versionId) {
            url += `?versionId=${encodeURIComponent(versionId)}`;
        }
        
        const res = await fetch(url);
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const data = await res.json();

        let imgs: any[] = [];
        if (Array.isArray(data)) imgs = data;
        else if (data?.images && Array.isArray(data.images)) imgs = data.images;
        else if (data?.data && Array.isArray(data.data)) imgs = data.data;

        const mapped: BlueprintImage[] = imgs.map((it: any) => ({
          id: it.id ?? it._id ?? String(Math.random()),
          url: it.url ?? it.file_url ?? it.dataUrl ?? it.src ?? null,
        }));

        setImages(mapped);
      } catch (err: any) {
        setError(err?.message ?? String(err));
        setImages([]);
      } finally {
        setLoading(false);
      }
    },
    [propId, versionId]
  );
  
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return { images, loading, error, refetch: fetchImages } as const;
}
