import { useEffect, useMemo, useRef, useState } from "react";

export interface StreamImage {
  id: string;
  name: string;
  path: string;
  pageNumber?: number;
  processingTime?: number;
}

export interface StreamProgress {
  total: number;
  processed: number;
  currentFile?: string;
}

export function useBlueprintStream(jobId?: string) {
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState<"pending" | "processing" | "completed" | "failed" | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [progress, setProgress] = useState<StreamProgress | undefined>();
  const [images, setImages] = useState<StreamImage[]>([]);
  const esRef = useRef<EventSource | null>(null);

  const url = useMemo(() => (jobId ? `/api/blueprints/stream?jobId=${encodeURIComponent(jobId)}` : undefined), [jobId]);

  useEffect(() => {
    if (!url) return;

    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => setConnected(true);
    es.onerror = () => {
      setConnected(false);
      // don't set error here; server may close when job completes
    };

    es.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (!data) return;
        if (data.type === "snapshot") {
          setStatus(data.status);
          setProgress(data.progress);
          if (Array.isArray(data.processedImages)) setImages(data.processedImages);
        } else if (data.type === "status") {
          setStatus(data.status);
          if (data.progress) setProgress(data.progress);
        } else if (data.type === "progress") {
          if (data.progress) setProgress(data.progress);
        } else if (data.type === "image" && data.image) {
          setImages((prev) => [...prev, data.image]);
          if (data.progress) setProgress(data.progress);
        } else if (data.type === "error") {
          setError(data.error || "Unknown error");
          setStatus("failed");
        }
      } catch (e) {
        // ignore
      }
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [url]);

  return {
    connected,
    status,
    error,
    progress,
    images,
  };
}
