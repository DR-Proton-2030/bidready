"use client";

import React, { useState } from "react";
import { useBlueprints } from "@/hooks/useBlueprints/useBlueprints";
import Header from "@/components/pages/createBlueprint/Header";
import TitleField from "@/components/pages/createBlueprint/TitleField";
import DescriptionField from "@/components/pages/createBlueprint/DescriptionField";
import ScopeField from "@/components/pages/createBlueprint/ScopeField";
import VersionTypeFileRow from "@/components/pages/createBlueprint/VersionTypeFileRow";
import StatusBadges from "@/components/pages/createBlueprint/StatusBadges";
import ErrorMessage from "@/components/pages/createBlueprint/ErrorMessage";
import CreateBlueprintStepper from "@/components/pages/createBlueprint/CreateBlueprintStepper";
import ImagePreviewStep from "@/components/pages/createBlueprint/ImagePreviewStep";
import EnhancedFileUpload from "@/components/shared/fileUpload/EnhancedFileUpload";
import { useFileProcessor } from "@/hooks/useFileProcessor";

const statusOptions = ["active", "completed", "on-hold", "in-progress"];

const steps = [
  {
    id: 1,
    title: "Upload Files",
    description: "Upload blueprint images or PDF files",
  },
  {
    id: 2,
    title: "Preview Images",
    description: "Review and confirm processed images",
  },
];

export default function CreateBlueprintPage({
  initialProjectId = "",
}: {
  initialProjectId?: string;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    description: "",
    version: "v1",
    status: "active",
    type: "",
    project_object_id: initialProjectId || "",
  });
  const [error, setError] = useState("");
  const { handleNewBlueprint } = useBlueprints();

  // Use a single file processor hook for the entire component
  const {
    processedImages: hookProcessedImages,
    error: fileError,
    processNewFile,
    removeImage,
    clearAll,
    isProcessing,
    fileType,
    totalPages,
  } = useFileProcessor();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      processNewFile(file);
      console.log("File selected for processing:", file.name);
    }
  };

  const handleFileUpload = async (file: File | null) => {
    if (file) {
      try {
        await processNewFile(file);
        console.log("File processed successfully:", file.name);
      } catch (error) {
        console.error("Error processing file:", error);
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (status: string) => {
    setForm({ ...form, status });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.project_object_id) {
      setError("Name, description and project are required.");
      return;
    }
    if (hookProcessedImages.length === 0) {
      setError("Please upload at least one image or PDF file.");
      return;
    }
    setError("");
    (async () => {
      try {
        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("description", form.description);
        fd.append("version", form.version || "v1");
        fd.append("status", form.status);
        fd.append("type", form.type || "");
        fd.append("project_object_id", form.project_object_id);

        // Add processed images. Convert from hook's ProcessedImage to blobs
        if (hookProcessedImages.length > 0) {
          // For now, create blobs from the dataUrls in hookProcessedImages
          const imageBlobs = await Promise.all(
            hookProcessedImages.map(async (img) => {
              const response = await fetch(img.dataUrl);
              const blob = await response.blob();
              return { blob, name: img.name };
            })
          );

          // Backend expects single file (compatible with multer maxCount: 1)
          const firstImage = imageBlobs[0];
          fd.append("blueprint_file", firstImage.blob, firstImage.name);
          fd.append("blueprint_files_count", String(imageBlobs.length));
        }

        console.log("======>payload", hookProcessedImages);
        await handleNewBlueprint(fd);
        // success - navigate to blueprints list
        // router.push("/blueprints");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to create blueprint";
        setError(message);
      }
    })();
  };

  return (
    <div className="bg-white flex py-5 h-[87vh] w-full px-6">
      <div className="bg-white w-[80%]">
        <CreateBlueprintStepper
          steps={steps}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          canProceed={currentStep === 1 ? hookProcessedImages.length > 0 : true}
        >
          <form onSubmit={handleSubmit} className="divide-y divide-gray-100">
            {currentStep === 1 && (
              <div className="space-y-6">
                <Header
                  button={false}
                  description={
                    "Enter the name of your blueprint. This will be your primary identifier. Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio."
                  }
                />

                <TitleField value={form.name} onChange={handleChange} />

                <DescriptionField
                  value={form.description}
                  onChange={handleTextareaChange}
                />

                <StatusBadges
                  options={statusOptions}
                  active={form.status}
                  onChange={handleStatusChange}
                />

                <ScopeField
                  value={form.project_object_id}
                  onChange={handleChange}
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <Header
                  button={true}
                  description={
                    "Review the processed images before creating your blueprint. You can remove individual images or go back to upload different files."
                  }
                />

                <VersionTypeFileRow
                  version={form.version}
                  type={form.type}
                  onChange={handleChange}
                  onFileChange={handleFileChange}
                />

                {error && <ErrorMessage message={error} />}
              </div>
            )}
          </form>
        </CreateBlueprintStepper>
      </div>
    </div>
  );
}
