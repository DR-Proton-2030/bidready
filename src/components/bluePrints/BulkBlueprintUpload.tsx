"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  onAllDone: () => void;
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
  const [hasCalledDone, setHasCalledDone] = useState(false);

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

  useEffect(() => {
    if (hasCalledDone) return;
    const allSettled = files.every((f) => {
      const s = itemStates[fileKeyFor(f)]?.status;
      return s === "done" || s === "error";
    });
    if (!allSettled) return;

    setHasCalledDone(true);
    const timer = setTimeout(() => onAllDone(), 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemStates, files, hasCalledDone]);

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
          />
        ))}
      </div>
    </div>
  );
}
