import { useCallback, useEffect, useRef, useState } from "react";

export interface BlueprintImage {
  id: string;
  url?: string | null;
  detection?: any;
  roomCorridorDetections?: any[];
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

  // Track whether images were expected but not yet available (triggers polling)
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(false);

  const fetchImages = useCallback(
    async (overrideId?: string | null, options?: { silent?: boolean }): Promise<BlueprintImage[]> => {
      const silent = options?.silent ?? false;
      const id = overrideId ?? resolveIdFromWindow(propId);
      if (!id) {
        setError("No blueprint id found in route or props");
        setImages([]);
        return [];
      }

      if (!silent) setLoading(true);
      setError(null);

      try {
        const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_BLUEPRINTS_API_URL || "http://localhost:8989";
        let url = `${base}/blueprints/get-blueprint-images/${encodeURIComponent(id)}`;
        if (versionId) {
          url += `?versionId=${encodeURIComponent(versionId)}`;
        }

        // Cache-bust: avoid stale empty responses during the eventual-consistency window
        const sep = url.includes("?") ? "&" : "?";
        url += `${sep}_t=${Date.now()}`;

        const token = typeof window !== "undefined" ? localStorage.getItem("@token") : null;
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(url, {
          cache: "no-store",
          headers,
        });
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const data = await res.json();

        let imgs: any[] = [];
        if (Array.isArray(data)) imgs = data;
        else if (data?.images && Array.isArray(data.images)) imgs = data.images;
        else if (data?.data && Array.isArray(data.data)) imgs = data.data;

        const mapped: BlueprintImage[] = imgs.map((it: any) => ({
          id: it.id ?? it._id ?? String(Math.random()),
          url: it.url ?? it.file_url ?? it.dataUrl ?? it.src ?? null,
          detection: it.detection ?? null,
          roomCorridorDetections: it.roomCorridorDetections ?? null,
        }));

        setImages(mapped);
        return mapped;
      } catch (err: any) {
        setError(err?.message ?? String(err));
        setImages([]);
        return [];
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [propId, versionId]
  );

  // Initial fetch + automatic retry-polling when result is empty
  useEffect(() => {
    cancelledRef.current = false;
    let attempts = 0;
    const maxAttempts = 24;        // ~2 min total
    const intervalMs = 5_000;      // poll every 5 s

    const clearPoll = () => {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };

    const poll = async () => {
      if (cancelledRef.current) return;

      const list = await fetchImages(undefined, { silent: attempts > 0 });

      // If we got images or hit the cap, stop polling
      if (cancelledRef.current || list.length > 0 || attempts >= maxAttempts) return;

      attempts += 1;
      pollTimerRef.current = setTimeout(poll, intervalMs);
    };

    poll();

    return () => {
      cancelledRef.current = true;
      clearPoll();
    };
  }, [fetchImages]);

  return {
    images,
    loading,
    error,
    refetch: (overrideId?: string | null) => fetchImages(overrideId),
  } as const;
}
