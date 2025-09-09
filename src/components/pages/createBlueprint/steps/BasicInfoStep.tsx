"use client";
import React from "react";
import TitleField from "@/components/pages/createBlueprint/TitleField";
import DescriptionField from "@/components/pages/createBlueprint/DescriptionField";
import ScopeField from "@/components/pages/createBlueprint/ScopeField";
import StatusBadges from "@/components/pages/createBlueprint/StatusBadges";

interface BasicInfoStepProps {
  form: {
    name: string;
    description: string;
    status: string;
    project_object_id: string;
  };
  statusOptions: string[];
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onTextareaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onStatusChange: (status: string) => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  form,
  statusOptions,
  onChange,
  onTextareaChange,
  onStatusChange,
}) => {
  return (
    <div className="space-y-6 flex">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Basic Information
        </h2>
        <p className="text-gray-600">
          Enter the basic details for your blueprint. This information will help
          identify and organize your blueprint.
        </p>
      </div>

      <div className="space-y-6">
        <TitleField value={form.name} onChange={onChange} />

        <DescriptionField
          value={form.description}
          onChange={onTextareaChange}
        />

        <StatusBadges
          options={statusOptions}
          active={form.status}
          onChange={onStatusChange}
        />

        <ScopeField value={form.project_object_id} onChange={onChange} />
      </div>
    </div>
  );
};

export default BasicInfoStep;
