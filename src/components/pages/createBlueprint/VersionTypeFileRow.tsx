"use client";
import React from "react";

interface Props {
  version: string;
  type: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const VersionTypeFileRow: React.FC<Props> = ({
  version,
  type,
  onChange,
  onFileChange,
}) => (
  <div className="flex items-start justify-between px-6 py-6 gap-8">
    <div className="flex-1">
      <label className="block font-medium mb-1">Version</label>
      <p className="text-sm text-gray-500">Blueprint version.</p>
    </div>
    <div className="flex-1 grid grid-cols-3 gap-4">
      <input
        name="version"
        type="text"
        value={version}
        onChange={onChange}
        className="col-span-1 w-full px-4 py-2 rounded border border-gray-200"
        placeholder="v1"
      />
      <input
        name="type"
        type="text"
        value={type}
        onChange={onChange}
        className="col-span-1 w-full px-4 py-2 rounded border border-gray-200"
        placeholder="floor_plan"
      />
      <input
        name="blueprint_file"
        type="file"
        onChange={onFileChange}
        className="col-span-1"
      />
    </div>
  </div>
);

export default VersionTypeFileRow;
