"use client";

import React, { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import BulkBlueprintUploadItem, {
  BulkUploadItemStatus,
} from "./BulkBlueprintUploadItem";
import BulkBlueprintEditOverlay from "./BulkBlueprintEditOverlay";
import BulkBlueprintDetectionOverlay from "./BulkBlueprintDetectionOverlay";
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

interface ActiveOverlay {
  type: "edit" | "detect";
  fileKey: string;
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
  // Created blueprint id per file, populated as each upload's create call
  // resolves, so Edit/Detect can be opened for that specific blueprint.
  const [blueprintIds, setBlueprintIds] = useState<Record<string, string>>({});
  const [activeOverlay, setActiveOverlay] = useState<ActiveOverlay | null>(null);

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
    setBlueprintIds((prev) => ({ ...prev, [fileKey]: blueprintId }));
  };

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

  const allSettled = files.length > 0 && completedCount === files.length;

  // Overlays are rendered ADDITIONALLY (not instead of the hub below) — both
  // use fixed/full-screen positioning, so they visually cover the hub without
  // unmounting the upload items underneath. Unmounting them would tear down
  // each item's in-flight/completed upload state and remount fresh instances,
  // which would re-fire the upload POST and create duplicate blueprints.
  const activeFile = activeOverlay
    ? files.find((f) => fileKeyFor(f) === activeOverlay.fileKey)
    : undefined;
  const activeBlueprintId = activeOverlay
    ? blueprintIds[activeOverlay.fileKey]
    : undefined;

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Uploading {files.length} Blueprint{files.length === 1 ? "" : "s"}
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 flex items-center gap-2">
            {completedCount < files.length && (
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            )}
            {completedCount} of {files.length} complete
            {errorCount > 0 ? ` (${errorCount} failed)` : ""}
          </span>
          {allSettled && (
            <button
              type="button"
              onClick={onAllDone}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          )}
        </div>
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
            onAction={(action) =>
              setActiveOverlay({ type: action, fileKey: fileKeyFor(file) })
            }
          />
        ))}
      </div>
    </div>

    {activeOverlay && activeFile && activeBlueprintId && (
      activeOverlay.type === "edit" ? (
        <BulkBlueprintEditOverlay
          file={activeFile}
          blueprintId={activeBlueprintId}
          name={deriveBlueprintNameFromFilename(activeFile.name)}
          onDone={() => setActiveOverlay(null)}
        />
      ) : (
        <BulkBlueprintDetectionOverlay
          blueprintId={activeBlueprintId}
          onDone={() => setActiveOverlay(null)}
        />
      )
    )}
    </>
  );
}
