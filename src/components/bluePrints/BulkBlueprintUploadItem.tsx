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
}: BulkBlueprintUploadItemProps) {
  const fileKey = `${file.name}_${file.size}_${file.lastModified}`;
  const { createBlueprintWithStreaming, streamingProgress } = useCreateBlueprint();
  const [itemStatus, setItemStatus] = useState<BulkUploadItemStatus>("uploading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const onStatusChangeRef = useRef(onStatusChange);
  onStatusChangeRef.current = onStatusChange;

  useEffect(() => {
    let cancelled = false;

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
      onFirstResponse: () => {
        if (cancelled) return;
        setItemStatus("processing");
        onStatusChangeRef.current(fileKey, "processing", 0);
      },
      onImageProcessed: (data) => {
        if (cancelled) return;
        const progress = typeof data?.progress === "number" ? data.progress : 0;
        onStatusChangeRef.current(fileKey, "processing", progress);
      },
      onComplete: () => {
        if (cancelled) return;
        setItemStatus("done");
        onStatusChangeRef.current(fileKey, "done", 100);
      },
      onError: (err) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Upload failed";
        setItemStatus("error");
        setErrorMessage(message);
        onStatusChangeRef.current(fileKey, "error", 0, message);
      },
    }).catch(() => {
      // handled via onError callback
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  const handleRetry = () => setAttempt((a) => a + 1);

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
