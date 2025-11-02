import { useState, useCallback } from "react";

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

  const createBlueprintWithStreaming = useCallback(
    async (fd: FormData, callbacks: Callbacks = {}) => {
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
        const res = await fetch(`${BACKEND_URL}/blueprints/create-blueprint`, {
          method: "POST",
          body: fd,
          credentials: "include",
          headers,
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          throw new Error(errBody?.message || `Failed to create blueprint (${res.status})`);
        }

        if (!res.body) throw new Error("Response body is null - streaming not supported");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        let buffer = "";
        let firstChunkReceived = false;
        let chunkCount = 0;

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

              chunkCount++;
              if (!firstChunkReceived) firstChunkReceived = true;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                if (!line.trim()) continue;
                try {
                  const data = JSON.parse(line);

                  // First response shape handling
                  if (data.message === "Blueprint created, processing images...") {
                    // Resolve ids/urls from multiple possible shapes
                    const newBlueprintId =
                      data.blueprint_id || data.blueprint?._id || data.blueprint?.id || data.data?.blueprint?._id || data.data?.blueprint?.id || data.data?._id;
                    const pdfFileUrl = data.file_url || data.data?.file_url || data.data?.blueprint?.file_url || data.blueprint?.file_url;

                    if (newBlueprintId) {
                      setBlueprintId(newBlueprintId);
                      callbacks.onFirstResponse && callbacks.onFirstResponse({ ...data, blueprint_id: newBlueprintId });
                    } else {
                      callbacks.onFirstResponse && callbacks.onFirstResponse(data);
                    }

                    if (pdfFileUrl) {
                      setPdfUrl(pdfFileUrl);
                    }
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
                    // generic callback for any other messages
                    // some backends may send other structured messages
                    callbacks.onImageProcessed && callbacks.onImageProcessed(data);
                  }
                } catch (parseError) {
                  console.error("useCreateBlueprint: Error parsing streaming line:", parseError, line);
                }
              }
            }
          } catch (streamError) {
            console.error("useCreateBlueprint stream error:", streamError);
            setIsStreaming(false);
            setIsUploading(false);
            callbacks.onError && callbacks.onError(streamError);
          }
        };

        // Start loop but don't await it here so caller can continue
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
    pdfUrl,
    blueprintId,
    createBlueprintWithStreaming,
  };
}
