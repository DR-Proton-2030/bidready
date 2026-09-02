"use client";

import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, FileText, RotateCcw, XCircle } from "lucide-react";
import useCreateBlueprint from "@/hooks/useCreateBlueprint";

export type BulkUploadItemStatus = "uploading" | "processing" | "done" | "error";

interface BulkBlueprintUploadItemProps {
  file: File;
  description: string;
  version: string;
  status: string;
  type: string;
  project_object_id: string;
  name: string;
  onStatusChange: (
    fileKey: string,
    status: BulkUploadItemStatus,
    progress: number,
    errorMessage?: string
  ) => void;
  onBlueprintCreated?: (fileKey: string, blueprintId: string) => void;
}

export default function BulkBlueprintUploadItem({
  file,
  description,
  version,
  status,
  type,
  project_object_id,
  name,
  onStatusChange,
  onBlueprintCreated,
}: BulkBlueprintUploadItemProps) {
  const fileKey = `${file.name}_${file.size}_${file.lastModified}`;
  const { createBlueprintWithStreaming, streamingProgress } = useCreateBlueprint();
  const [itemStatus, setItemStatus] = useState<BulkUploadItemStatus>("uploading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const onStatusChangeRef = useRef(onStatusChange);
  onStatusChangeRef.current = onStatusChange;
  const onBlueprintCreatedRef = useRef(onBlueprintCreated);
  onBlueprintCreatedRef.current = onBlueprintCreated;
  // Guards against React Strict Mode's dev-only double-invoke of this effect
  // (mount -> cleanup -> mount), which would otherwise fire the real upload
  // POST twice and race two blueprints for the same underlying WebSocket ref.
  const startedRef = useRef(false);
  // True once this item has reached a terminal state (done/error), so late
  // WebSocket messages or poll ticks can't move it backwards.
  const settledRef = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const clearPoll = () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };

    const settleDone = () => {
      if (settledRef.current) return;
      settledRef.current = true;
      clearPoll();
      setItemStatus("done");
      onStatusChangeRef.current(fileKey, "done", 100);
    };

    const settleError = (message: string) => {
      if (settledRef.current) return;
      settledRef.current = true;
      clearPoll();
      setItemStatus("error");
      setErrorMessage(message);
      onStatusChangeRef.current(fileKey, "error", 0, message);
    };

    // REST fallback for completion. The progress WebSocket is fire-and-forget
    // and can finish (small PDFs convert in ~1s) before this item's socket even
    // subscribes, so we can't rely on the WS "done" message alone. The worker
    // only sets a version's images_count in its finalize step, so images_count
    // > 0 is an authoritative "conversion finished" signal available over REST.
    const startPolling = (blueprintId: string) => {
      if (pollRef.current || settledRef.current) return;
      const BASE =
        process.env.NEXT_PUBLIC_BASE_URL ||
        process.env.NEXT_PUBLIC_BLUEPRINTS_API_URL ||
        "http://localhost:8989/api/v1";
      const token =
        typeof window !== "undefined" ? localStorage.getItem("@token") : null;

      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(
            `${BASE}/blueprints/get-blueprint-details/${blueprintId}`,
            { headers: token ? { Authorization: `Bearer ${token}` } : {} }
          );
          if (!res.ok) return;
          const json = await res.json();
          const versions = json?.data?.versions || [];
          const finished = versions.some(
            (v: { images_count?: number }) => (v?.images_count || 0) > 0
          );
          if (finished) settleDone();
        } catch {
          // ignore transient poll errors; next tick retries
        }
      }, 2500);
    };

    // startedRef ensures exactly one upload per component instance, so we do NOT
    // cancel the in-flight upload on Strict Mode's dev cleanup. We still return a
    // cleanup that clears the poll interval so it can't leak on real unmount.
    if (!startedRef.current) {
      startedRef.current = true;

      const fd = new FormData();
      fd.append("name", name);
      fd.append("description", description || "");
      fd.append("version", version || "");
      fd.append("status", status || "");
      fd.append("type", type || "");
      fd.append("project_object_id", project_object_id);
      fd.append("blueprint_file", file);

      setItemStatus("uploading");
      setErrorMessage(null);
      onStatusChangeRef.current(fileKey, "uploading", 0);

      createBlueprintWithStreaming(fd, {
        onFirstResponse: (data) => {
          setItemStatus("processing");
          onStatusChangeRef.current(fileKey, "processing", 0);
          const blueprintId =
            data?.blueprint_id ||
            data?.blueprint?._id ||
            data?.data?.blueprint?._id ||
            data?.data?._id;
          if (blueprintId) {
            onBlueprintCreatedRef.current?.(fileKey, String(blueprintId));
            startPolling(String(blueprintId));
          }
        },
        onImageProcessed: (data) => {
          if (settledRef.current) return;
          const progress =
            typeof data?.progress === "number" ? data.progress : 0;
          onStatusChangeRef.current(fileKey, "processing", progress);
        },
        onComplete: () => {
          settleDone();
        },
        onError: (err) => {
          const message = err instanceof Error ? err.message : "Upload failed";
          settleError(message);
        },
      }).catch(() => {
        // handled via onError callback
      });
    }

    return clearPoll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const handleRetry = () => {
    startedRef.current = false;
    settledRef.current = false;
    setAttempt((a) => a + 1);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
            <p className="text-xs text-gray-500 truncate">{file.name}</p>
          </div>
        </div>

        {itemStatus === "done" && (
          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
        )}
        {itemStatus === "error" && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <XCircle className="h-5 w-5 text-red-500" />
            <button
              type="button"
              onClick={handleRetry}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Retry
            </button>
          </div>
        )}
      </div>

      {(itemStatus === "uploading" || itemStatus === "processing") && (
        <div className="mt-3">
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${itemStatus === "processing" ? streamingProgress : 5}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {itemStatus === "uploading" ? "Uploading..." : `Processing pages... ${streamingProgress}%`}
          </p>
        </div>
      )}

      {itemStatus === "error" && errorMessage && (
        <p className="text-xs text-red-600 mt-2">{errorMessage}</p>
      )}
    </div>
  );
}
