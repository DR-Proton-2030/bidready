import { useState, useCallback, useEffect, useRef } from "react";

type Callbacks = {
  onFirstResponse?: (data: any) => void;
  onImageProcessed?: (data: any) => void;
  onHeartbeat?: (data: any) => void;
  onComplete?: (data?: any) => void;
  onError?: (err: any) => void;
};

export default function useCreateVersion() {
  const [isUploading, setIsUploading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingProgress, setStreamingProgress] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const hasWsProgressRef = useRef(false);

  const closeSocket = useCallback(() => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {
        console.warn("useCreateVersion: failed to close websocket", e);
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
      return `${wsProtocol}//${parsed.hostname}`;
    } catch {
      if (typeof window !== "undefined") {
        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.hostname || "localhost";
        return `${wsProtocol}//${host}:8990`;
      }
      return "wss://d1cf5m2o7bf0ig.cloudfront.net";
    }
  }, []);

  const connectProgressSocket = useCallback(
    (
      targetBlueprintId: string,
      backendUrl: string,
      callbacks: Callbacks,
    ) => {
      closeSocket();
      hasWsProgressRef.current = false;

      const ws = new WebSocket(getWsUrl(backendUrl));
      wsRef.current = ws;

      ws.onopen = () => {
        callbacks.onHeartbeat?.({ type: "socket_connected", blueprintId: targetBlueprintId });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!data || data.blueprintId !== targetBlueprintId) return;

          if (data.type === "page_progress") {
            hasWsProgressRef.current = true;

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
          console.error("useCreateVersion websocket parse error:", error);
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

  const createVersionWithStreaming = useCallback(
    async (blueprintId: string, fd: FormData, callbacks: Callbacks = {}) => {
      setIsUploading(true);
      setIsStreaming(true);
      setStreamingProgress(0);

      const BACKEND_URL = getRuntimeBackendUrl();

      const token = typeof window !== "undefined" ? localStorage.getItem("@token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      try {
        const res = await fetch(`${BACKEND_URL}/blueprints/versions/${blueprintId}/upload`, {
          method: "POST",
          body: fd,
          credentials: "include",
          headers,
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          throw new Error(errBody?.message || `Failed to create version (${res.status})`);
        }

        const contentType = (res.headers.get("content-type") || "").toLowerCase();

        if (contentType.includes("application/json")) {
          const data = await res.json().catch(() => null);
          if (!data) {
            throw new Error("Invalid response from version upload API");
          }

          callbacks.onFirstResponse?.(data);
          connectProgressSocket(blueprintId, BACKEND_URL, callbacks);
          return;
        }

        if (!res.body) throw new Error("Response body is null - streaming not supported");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        let buffer = "";
        let firstChunkReceived = false;

        const processLoop = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                setIsStreaming(false);
                setIsUploading(false);
                callbacks.onComplete && callbacks.onComplete();
                break;
              }

              if (!firstChunkReceived) firstChunkReceived = true;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                if (!line.trim()) continue;
                try {
                  const data = JSON.parse(line);

                  if (data.status === "processing") {
                    callbacks.onFirstResponse && callbacks.onFirstResponse(data);

                    const streamedBlueprintId = data?.blueprint_id || data?.blueprint?._id || data?.data?.blueprint?._id;
                    if (streamedBlueprintId && !wsRef.current) {
                      connectProgressSocket(String(streamedBlueprintId), BACKEND_URL, callbacks);
                    }
                  } else if (data.type === "image_processed") {
                    if (!hasWsProgressRef.current) {
                      setStreamingProgress(typeof data.progress === "number" ? data.progress : (prev => prev));
                      callbacks.onImageProcessed && callbacks.onImageProcessed(data);
                    }
                  } else if (data.type === "heartbeat") {
                    callbacks.onHeartbeat && callbacks.onHeartbeat(data);
                  } else if (data.type === "complete") {
                    setIsStreaming(false);
                    setIsUploading(false);
                    closeSocket();
                    callbacks.onComplete && callbacks.onComplete(data);
                  } else if (data.type === "error") {
                    throw new Error(data.message || "Processing failed");
                  } else {
                    // Generic fallback
                    callbacks.onImageProcessed && callbacks.onImageProcessed(data);
                  }
                } catch (parseError) {
                  console.error("useCreateVersion: Error parsing streaming line:", parseError, line);
                }
              }
            }
          } catch (streamError) {
            console.error("useCreateVersion stream error:", streamError);
            setIsStreaming(false);
            setIsUploading(false);
            closeSocket();
            callbacks.onError && callbacks.onError(streamError);
          }
        };

        processLoop();
      } catch (err) {
        setIsStreaming(false);
        setIsUploading(false);
        closeSocket();
        callbacks.onError && callbacks.onError(err);
        throw err;
      }
    },
    [closeSocket, connectProgressSocket, getRuntimeBackendUrl]
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
    createVersionWithStreaming,
  };
}
