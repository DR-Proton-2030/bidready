"use client";
import React, { Suspense, lazy } from "react";

const LazyVersionTypeFileRow = lazy(() => import("./VersionTypeFileRowClient"));

interface Props {
  version: string;
  type: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const VersionTypeFileRow: React.FC<Props> = (props) => {
  return (
    <Suspense
      fallback={
        <div className="px-6 py-6">
          <div className="flex items-start justify-between gap-8 mb-6">
            <div className="flex-1">
              <label className="block font-medium mb-1">Version & Type</label>
              <p className="text-sm text-gray-500">
                Blueprint version and type.
              </p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <input
                name="version"
                type="text"
                value={props.version}
                onChange={props.onChange}
                className="w-full px-4 py-2 rounded border border-gray-200"
                placeholder="v1"
              />
              <input
                name="type"
                type="text"
                value={props.type}
                onChange={props.onChange}
                className="w-full px-4 py-2 rounded border border-gray-200"
                placeholder="floor_plan"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Blueprint Files</label>
            <p className="text-sm text-gray-500 mb-4">
              Loading file upload component...
            </p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="animate-pulse">
                <div className="h-12 w-12 bg-gray-300 rounded mx-auto mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <LazyVersionTypeFileRow {...props} />
    </Suspense>
  );
};

export default VersionTypeFileRow;
