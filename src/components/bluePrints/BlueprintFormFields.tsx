"use client";

import React from "react";
import TitleField from "./TitleField";
import DescriptionField from "./DescriptionField";
import StatusBadges from "./StatusBadges";
import ScopeField from "./ScopeField";
import { BlueprintFormData } from "@/@types/interface/blueprint.interface";

interface BlueprintFormFieldsProps {
  form: BlueprintFormData;
  statusOptions: string[];
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextareaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onStatusChange: (status: string) => void;
}

export default function BlueprintFormFields({
  form,
  statusOptions,
  onInputChange,
  onTextareaChange,
  onStatusChange,
}: BlueprintFormFieldsProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <TitleField value={form.name} onChange={onInputChange} />

      <DescriptionField
        value={form.description}
        onChange={onTextareaChange}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Version
          </label>
          <input
            name="version"
            type="text"
            value={form.version}
            onChange={onInputChange}
            className="w-full px-4 py-2 rounded border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="v1"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-2">
            Type
          </label>
          <input
            name="type"
            type="text"
            value={form.type}
            onChange={onInputChange}
            className="w-full px-4 py-2 rounded border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="floor_plan"
          />
        </div>
      </div>

      <StatusBadges
        options={statusOptions}
        active={form.status}
        onChange={onStatusChange}
      />

      <ScopeField
        value={form.project_object_id}
        onChange={onInputChange}
      />
    </div>
  );
}
