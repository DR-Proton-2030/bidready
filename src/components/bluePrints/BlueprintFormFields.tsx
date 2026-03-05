"use client";

import React from "react";
import TitleField from "./TitleField";
import DescriptionField from "./DescriptionField";
import StatusBadges from "./StatusBadges";
import ScopeField from "./ScopeField";
import { BlueprintFormData } from "@/@types/interface/blueprint.interface";
import { AlertCircle } from "lucide-react";

export type FieldErrors = Partial<Record<keyof BlueprintFormData, string>>;
export type TouchedFields = Partial<Record<keyof BlueprintFormData, boolean>>;

interface BlueprintFormFieldsProps {
  form: BlueprintFormData;
  statusOptions: string[];
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextareaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onStatusChange: (status: string) => void;
  fieldErrors?: FieldErrors;
  touched?: TouchedFields;
  onBlur?: (field: keyof BlueprintFormData) => void;
}

function FieldError({ error, show }: { error?: string; show?: boolean }) {
  if (!error || !show) return null;
  return (
    <p className="flex items-center gap-1 mt-1.5 text-xs text-red-500 animate-in fade-in slide-in-from-top-1">
      <AlertCircle className="w-3 h-3 flex-shrink-0" />
      {error}
    </p>
  );
}

export default function BlueprintFormFields({
  form,
  statusOptions,
  onInputChange,
  onTextareaChange,
  onStatusChange,
  fieldErrors = {},
  touched = {},
  onBlur,
}: BlueprintFormFieldsProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
      {/* Blueprint Title */}
      <div className="px-6 py-5 first:rounded-t-xl last:rounded-b-xl">
        <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
          <div className="md:w-1/3">
            <label className="block text-sm font-semibold text-gray-800">
              Blueprint title <span className="text-red-400">*</span>
            </label>
            <p className="text-xs text-gray-400 mt-0.5">Primary identifier for your blueprint</p>
          </div>
          <div className="md:w-2/3">
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={onInputChange}
              onBlur={() => onBlur?.("name")}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 ${
                touched.name && fieldErrors.name
                  ? "border-red-300 focus:ring-red-200 bg-red-50/30"
                  : "border-gray-200 focus:ring-blue-100 focus:border-blue-400"
              }`}
              placeholder="e.g. Downtown Office Floor Plan"
            />
            <FieldError error={fieldErrors.name} show={touched.name} />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-6 py-5">
        <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
          <div className="md:w-1/3">
            <label className="block text-sm font-semibold text-gray-800">
              Description <span className="text-red-400">*</span>
            </label>
            <p className="text-xs text-gray-400 mt-0.5">Brief overview of this blueprint</p>
          </div>
          <div className="md:w-2/3">
            <textarea
              name="description"
              value={form.description}
              onChange={onTextareaChange}
              onBlur={() => onBlur?.("description")}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 resize-none ${
                touched.description && fieldErrors.description
                  ? "border-red-300 focus:ring-red-200 bg-red-50/30"
                  : "border-gray-200 focus:ring-blue-100 focus:border-blue-400"
              }`}
              placeholder="Describe what this blueprint covers..."
              rows={3}
            />
            <FieldError error={fieldErrors.description} show={touched.description} />
          </div>
        </div>
      </div>

      {/* Version & Type - side by side */}
      <div className="px-6 py-5">
        <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
          <div className="md:w-1/3">
            <label className="block text-sm font-semibold text-gray-800">Details</label>
            <p className="text-xs text-gray-400 mt-0.5">Version number and blueprint type</p>
          </div>
          <div className="md:w-2/3 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Version</label>
              <input
                name="version"
                type="text"
                value={form.version}
                onChange={onInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                placeholder="v1"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Type</label>
              <input
                name="type"
                type="text"
                value={form.type}
                onChange={onInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                placeholder="floor_plan"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="px-6 py-5">
        <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
          <div className="md:w-1/3">
            <label className="block text-sm font-semibold text-gray-800">Status</label>
            <p className="text-xs text-gray-400 mt-0.5">Current state of this blueprint</p>
          </div>
          <div className="md:w-2/3">
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => {
                const isActive = form.status === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => onStatusChange(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-white shadow-md shadow-primary/25 scale-[1.02]"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Project */}
      <div className="px-6 py-5 first:rounded-t-xl last:rounded-b-xl">
        <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
          <div className="md:w-1/3">
            <label className="block text-sm font-semibold text-gray-800">
              Project <span className="text-red-400">*</span>
            </label>
            <p className="text-xs text-gray-400 mt-0.5">Link this blueprint to a project</p>
          </div>
          <div className="md:w-2/3">
            <ScopeField
              value={form.project_object_id}
              onChange={onInputChange}
              hasError={!!(touched.project_object_id && fieldErrors.project_object_id)}
              onBlur={() => onBlur?.("project_object_id")}
            />
            <FieldError error={fieldErrors.project_object_id} show={touched.project_object_id} />
          </div>
        </div>
      </div>
    </div>
  );
}
