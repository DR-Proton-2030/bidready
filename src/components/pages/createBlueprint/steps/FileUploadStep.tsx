"use client";
import React from "react";
import VersionTypeFileRow from "@/components/pages/createBlueprint/VersionTypeFileRow";

interface FileUploadStepProps {
  form: {
    version: string;
    type: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImagesProcessed: (images: Array<{ blob: Blob; name: string }>) => void;
}

const FileUploadStep: React.FC<FileUploadStepProps> = ({
  form,
  onChange,
  onFileChange,
  onImagesProcessed,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Upload Blueprint Files
        </h2>
        <p className="text-gray-600">
          Set the version and type for your blueprint, then upload your
          blueprint files. You can upload images or PDF files.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <VersionTypeFileRow
          version={form.version}
          type={form.type}
          onChange={onChange}
          onFileChange={onFileChange}
          onImagesProcessed={onImagesProcessed}
        />
      </div>
    </div>
  );
};

export default FileUploadStep;
