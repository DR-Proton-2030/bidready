"use client";

import React, { useState } from "react";
import { useBlueprints } from "@/hooks/useBlueprints/useBlueprints";
import { useRouter } from "next/navigation";
import Header from "@/components/pages/createBlueprint/Header";
import TitleField from "@/components/pages/createBlueprint/TitleField";
import DescriptionField from "@/components/pages/createBlueprint/DescriptionField";
import ScopeField from "@/components/pages/createBlueprint/ScopeField";
import VersionTypeFileRow from "@/components/pages/createBlueprint/VersionTypeFileRow";
import StatusBadges from "@/components/pages/createBlueprint/StatusBadges";
import ErrorMessage from "@/components/pages/createBlueprint/ErrorMessage";

const statusOptions = ["active", "completed", "on-hold", "in-progress"];

export default function CreateBlueprintPage({
  initialProjectId = "",
}: {
  initialProjectId?: string;
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    version: "v1",
    status: "active",
    type: "",
    project_object_id: initialProjectId || "",
  });
  const [blueprintFile, setBlueprintFile] = useState<File | null>(null);
  const [processedImages, setProcessedImages] = useState<
    Array<{ blob: Blob; name: string }>
  >([]);
  const [error, setError] = useState("");
  const { handleNewBlueprint } = useBlueprints();
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    setBlueprintFile(f || null);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (status: string) => {
    setForm({ ...form, status });
  };

  const handleImagesProcessed = (
    images: Array<{ blob: Blob; name: string }>
  ) => {
    setProcessedImages(images);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.project_object_id) {
      setError("Name, description and project are required.");
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

        // Add the original file for backward compatibility
        // if (blueprintFile) {
        //   fd.append("blueprint_file", blueprintFile);
        // }

        // Add processed images as an array
        if (processedImages.length > 0) {
          processedImages.forEach((image) => {
            fd.append(`blueprint_file`, image.blob, image.name);
          });
        }
        console.log("======>payload", processedImages);
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
    <div className=" bg-white  flex py-5 h-[87vh] w-full  px-6">
      <div className="bg-white  w-[80%]">
        <form onSubmit={handleSubmit} className="divide-y divide-gray-100  ">
          <Header
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
          <ScopeField value={form.project_object_id} onChange={handleChange} />

          <VersionTypeFileRow
            version={form.version}
            type={form.type}
            onChange={handleChange}
            onFileChange={handleFileChange}
            onImagesProcessed={handleImagesProcessed}
          />

          <ErrorMessage message={error} />

          {/* Submit handled at top header */}
        </form>
      </div>
    </div>
  );
}
