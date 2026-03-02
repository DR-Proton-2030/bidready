import { useState, useCallback, useRef, useEffect } from "react";

type Callbacks = {
  onFirstResponse?: (data: any) => void;
  onImageProcessed?: (data: any) => void;
  onHeartbeat?: (data: any) => void;
  onComplete?: (data?: any) => void;
  onError?: (err: any) => void;
};

export default function useCreateBlueprint() {
  const [isUploading, setIsUploading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingProgress, setStreamingProgress] = useState(0);
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);
  const [blueprintId, setBlueprintId] = useState<string | undefined>(undefined);
  const wsRef = useRef<WebSocket | null>(null);

  const closeSocket = useCallback(() => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {
        console.warn("useCreateBlueprint: failed to close websocket", e);
      }
      wsRef.current = null;
    }
  }, []);

  const getRuntimeBackendUrl = useCallback(() => {
    if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
    if (process.env.NEXT_PUBLIC_BLUEPRINTS_API_URL) return process.env.NEXT_PUBLIC_BLUEPRINTS_API_URL;

    if (typeof window !== "undefined") {
      const protocol = window.location.protocol === "https:" ? "https:" : "http:";
      const host = window.location.hostname || "localhost";
      return `${protocol}//${host}:8989/api/v1`;
    }

    return "http://localhost:8989/api/v1";
  }, []);

  const normalizeFileUrl = useCallback((rawUrl: string | undefined, backendUrl: string) => {
    if (!rawUrl) return undefined;

    try {
      const backend = new URL(backendUrl);
      const raw = new URL(rawUrl, backend.origin);

      if (
        ["localhost", "127.0.0.1", "0.0.0.0"].includes(raw.hostname) &&
        !["localhost", "127.0.0.1", "0.0.0.0"].includes(backend.hostname)
      ) {
        raw.hostname = backend.hostname;
      }

      return raw.toString();
    } catch {
      return rawUrl;
    }
  }, []);

  const getWsUrl = useCallback((backendUrl: string) => {
    const explicitWsUrl = process.env.NEXT_PUBLIC_PDF_CONVERTER_WS_URL;
    if (explicitWsUrl) {
      return explicitWsUrl;
    }

    try {
      const parsed = new URL(backendUrl);
      const isSecure = parsed.protocol === "https:";
      const wsProtocol = isSecure ? "wss:" : "ws:";

      const currentPort = parsed.port
        ? Number(parsed.port)
        : isSecure
          ? 443
          : 80;

      const wsPort = currentPort + 1;

      return `${wsProtocol}//${parsed.hostname}:${wsPort}`;
    } catch (e) {
      if (typeof window !== "undefined") {
        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.hostname || "localhost";
        return `${wsProtocol}//${host}:8990`;
      }
      return "ws://localhost:8990";
    }
  }, []);

  const connectProgressSocket = useCallback(
    (
      targetBlueprintId: string,
      backendUrl: string,
      callbacks: Callbacks,
    ) => {
      closeSocket();

      const wsUrl = getWsUrl(backendUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        callbacks.onHeartbeat?.({ type: "socket_connected", wsUrl, blueprintId: targetBlueprintId });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!data || data.blueprintId !== targetBlueprintId) return;

          if (data.type === "page_progress") {
            const totalPages = typeof data.totalPages === "number" ? data.totalPages : 0;
            const page = typeof data.page === "number" ? data.page : 0;
            const progress = totalPages > 0 ? Math.round((page / totalPages) * 100) : 0;

            setStreamingProgress(progress);

            callbacks.onImageProcessed?.({
              type: "image_processed",
              page,
              total_pages: totalPages,
              image_url: data.imageUrl,
              image_id: undefined,
              progress,
            });
          }

          if (data.type === "job_status") {
            if (data.status === "started") {
              setIsStreaming(true);
              callbacks.onHeartbeat?.({
                type: "job_status",
                status: "started",
                total_pages: data.totalPages,
              });
            } else if (data.status === "done") {
              setStreamingProgress(100);
              setIsStreaming(false);
              setIsUploading(false);
              callbacks.onComplete?.({ type: "complete", blueprint_id: targetBlueprintId });
              closeSocket();
            } else if (data.status === "failed") {
              const err = new Error(data.error || "PDF conversion failed");
              setIsStreaming(false);
              setIsUploading(false);
              callbacks.onError?.(err);
              closeSocket();
            }
          }
        } catch (error) {
          console.error("useCreateBlueprint websocket parse error:", error);
        }
      };

      ws.onerror = () => {
        callbacks.onHeartbeat?.({ type: "socket_error", blueprintId: targetBlueprintId });
      };

      ws.onclose = () => {
        wsRef.current = null;
      };
    },
    [closeSocket, getWsUrl],
  );

  const createBlueprintWithStreaming = useCallback(
    async (fd: FormData, callbacks: Callbacks = {}) => {
      setIsUploading(true);
      setIsStreaming(true);
      setStreamingProgress(0);

      const token = typeof window !== "undefined" ? localStorage.getItem("@token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const BACKEND_URL = getRuntimeBackendUrl();

      try {
        const res = await fetch(`${BACKEND_URL}/blueprints/create-blueprint`, {
          method: "POST",
          body: fd,
          headers,
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          throw new Error(errBody?.message || `Failed to create blueprint (${res.status})`);
        }

        const data = await res.json().catch(() => null);

        if (!data) {
          throw new Error("Invalid response from create-blueprint API");
        }

        const newBlueprintId =
          data.blueprint_id ||
          data.blueprint?._id ||
          data.blueprint?.id ||
          data.data?.blueprint?._id ||
          data.data?.blueprint?.id ||
          data.data?._id;
        const rawPdfFileUrl =
          data.file_url ||
          data.data?.file_url ||
          data.data?.blueprint?.file_url ||
          data.blueprint?.file_url;
        const pdfFileUrl = normalizeFileUrl(rawPdfFileUrl, BACKEND_URL);

        if (!newBlueprintId) {
          throw new Error("Blueprint created but blueprint_id was not returned");
        }

        setBlueprintId(newBlueprintId);

        if (pdfFileUrl) {
          setPdfUrl(pdfFileUrl);
        }

        callbacks.onFirstResponse?.({
          ...data,
          blueprint_id: newBlueprintId,
          file_url: pdfFileUrl,
          message: data.message || "Blueprint created, processing images...",
        });

        connectProgressSocket(newBlueprintId, BACKEND_URL, callbacks);
      } catch (err) {
        setIsStreaming(false);
        setIsUploading(false);
        closeSocket();
        callbacks.onError?.(err);
        throw err;
      }
    },
    [closeSocket, connectProgressSocket, getRuntimeBackendUrl, normalizeFileUrl]
  );

  useEffect(() => {
    return () => {
      closeSocket();
    };
  }, [closeSocket]);

  return {
    isUploading,
    isStreaming,
    streamingProgress,
    pdfUrl,
    blueprintId,
    createBlueprintWithStreaming,
  };
}
