import { useState, useCallback } from "react";

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

  const createVersionWithStreaming = useCallback(
    async (blueprintId: string, fd: FormData, callbacks: Callbacks = {}) => {
      setIsUploading(true);
      setIsStreaming(true);
      setStreamingProgress(0);

      const BACKEND_URL =
        process.env.NEXT_PUBLIC_BASE_URL ||
        process.env.NEXT_PUBLIC_BLUEPRINTS_API_URL ||
        "http://localhost:8989";

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
                  } else if (data.type === "image_processed") {
                    setStreamingProgress(typeof data.progress === "number" ? data.progress : (prev => prev));
                    callbacks.onImageProcessed && callbacks.onImageProcessed(data);
                  } else if (data.type === "heartbeat") {
                    callbacks.onHeartbeat && callbacks.onHeartbeat(data);
                  } else if (data.type === "complete") {
                    setIsStreaming(false);
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
            callbacks.onError && callbacks.onError(streamError);
          }
        };

        processLoop();
      } catch (err) {
        setIsStreaming(false);
        setIsUploading(false);
        callbacks.onError && callbacks.onError(err);
        throw err;
      }
    },
    []
  );

  return {
    isUploading,
    isStreaming,
    streamingProgress,
    createVersionWithStreaming,
  };
}
