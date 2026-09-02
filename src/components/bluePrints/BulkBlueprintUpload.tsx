"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import BulkBlueprintUploadItem, {
  BulkUploadItemStatus,
} from "./BulkBlueprintUploadItem";
import {
  deriveBlueprintNameFromFilename,
  inferBlueprintTypeFromFilename,
} from "@/utils/blueprintHelpers";

interface BulkBlueprintUploadProps {
  files: File[];
  description: string;
  version: string;
  status: string;
  project_object_id: string;
  // firstBlueprintId is the created blueprint for the first file (in selection
  // order), so the caller can open its editor once everything finishes.
  onAllDone: (firstBlueprintId?: string) => void;
}

interface ItemState {
  status: BulkUploadItemStatus;
  progress: number;
}

const fileKeyFor = (file: File) => `${file.name}_${file.size}_${file.lastModified}`;

export default function BulkBlueprintUpload({
  files,
  description,
  version,
  status,
  project_object_id,
  onAllDone,
}: BulkBlueprintUploadProps) {
  const [itemStates, setItemStates] = useState<Record<string, ItemState>>({});
  // Ref (not state) so scheduling the redirect doesn't trigger a re-render that
  // would re-run the effect and clear its own pending timer before it fires.
  const doneScheduledRef = useRef(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Created blueprint id per file, so we can open the first file's editor when
  // the whole batch finishes.
  const blueprintIdsRef = useRef<Record<string, string>>({});

  const handleStatusChange = (
    fileKey: string,
    itemStatus: BulkUploadItemStatus,
    progress: number
  ) => {
    setItemStates((prev) => ({
      ...prev,
      [fileKey]: { status: itemStatus, progress },
    }));
  };

  const handleBlueprintCreated = (fileKey: string, blueprintId: string) => {
    blueprintIdsRef.current[fileKey] = blueprintId;
  };

  // First blueprint id in file-selection order (fall back to any that exists).
  const getFirstBlueprintId = () => {
    for (const f of files) {
      const id = blueprintIdsRef.current[fileKeyFor(f)];
      if (id) return id;
    }
    return undefined;
  };

  useEffect(() => {
    if (doneScheduledRef.current) return;
    const allSettled =
      files.length > 0 &&
      files.every((f) => {
        const s = itemStates[fileKeyFor(f)]?.status;
        return s === "done" || s === "error";
      });
    if (!allSettled) return;

    // Schedule the redirect exactly once. No cleanup here on purpose — this
    // effect must not clear its own timer on a later re-render; the ref guard
    // guarantees single scheduling and the unmount effect below clears it.
    doneScheduledRef.current = true;
    redirectTimerRef.current = setTimeout(
      () => onAllDone(getFirstBlueprintId()),
      800
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemStates, files]);

  // Clear the pending redirect only on real unmount.
  useEffect(
    () => () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    },
    []
  );

  const completedCount = useMemo(
    () =>
      files.filter((f) => {
        const s = itemStates[fileKeyFor(f)]?.status;
        return s === "done" || s === "error";
      }).length,
    [files, itemStates]
  );

  const errorCount = useMemo(
    () =>
      files.filter((f) => itemStates[fileKeyFor(f)]?.status === "error").length,
    [files, itemStates]
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Uploading {files.length} Blueprint{files.length === 1 ? "" : "s"}
        </h2>
        <span className="text-sm text-gray-500 flex items-center gap-2">
          {completedCount < files.length && (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          )}
          {completedCount} of {files.length} complete
          {errorCount > 0 ? ` (${errorCount} failed)` : ""}
        </span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(completedCount / files.length) * 100}%` }}
        />
      </div>

      <div className="space-y-3">
        {files.map((file) => (
          <BulkBlueprintUploadItem
            key={fileKeyFor(file)}
            file={file}
            name={deriveBlueprintNameFromFilename(file.name)}
            type={inferBlueprintTypeFromFilename(file.name)}
            description={description}
            version={version}
            status={status}
            project_object_id={project_object_id}
            onStatusChange={handleStatusChange}
            onBlueprintCreated={handleBlueprintCreated}
          />
        ))}
      </div>
    </div>
  );
}
