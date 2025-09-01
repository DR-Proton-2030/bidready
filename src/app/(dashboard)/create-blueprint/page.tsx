"use client";

import React, { useState } from "react";
import { useBlueprints } from "@/hooks/useBlueprints/useBlueprints";
import { useRouter } from "next/navigation";

const statusOptions = ["active", "completed", "on-hold", "in-progress"];

export default function CreateBlueprintPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    version: "v1",
    status: "active",
    type: "",
    project_object_id: "",
  });
  const [blueprintFile, setBlueprintFile] = useState<File | null>(null);
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

  const handleStatusChange = (status: string) => {
    setForm({ ...form, status });
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
        if (blueprintFile) fd.append("blueprint_file", blueprintFile);

        await handleNewBlueprint(fd);
        // success - navigate to blueprints list
        router.push("/blueprints");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to create blueprint";
        setError(message);
      }
    })();
  };

  return (
    <div className=" bg-white flex py-5 border-t border-gray-200 shadow-md rounded-xl w-full  px-6">
      <div className="bg-white  w-[80%]">
        <h2 className="px-6 pt-6 pb-3 text-3xl font-semibold ">
          Create Blueprint
        </h2>
        <p className="px-6 pb-6 text-sm text-gray-500 border-b border-gray-200">
          Enter the name of your blueprint. This will be your primary
          identifier. Lorem ipsum dolor sit amet consectetur adipisicing elit.
          Distinctio.
        </p>
        <form onSubmit={handleSubmit} className="divide-y divide-gray-100  ">
          {/* Title */}
          <div className="flex items-start justify-between px-6 py-6 gap-8">
            <div className="flex-1">
              <label className="block font-medium mb-1">Blueprint title</label>
              <p className="text-sm text-gray-500">
                Enter the name of your blueprint. This will be your primary
                identifier.
              </p>
            </div>
            <div className="flex-1">
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Downtown Office"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex items-start justify-between px-6 py-6 gap-8">
            <div className="flex-1">
              <label className="block font-medium mb-1">Description</label>
              <p className="text-sm text-gray-500">
                Provide a brief description of the blueprint.
              </p>
            </div>
            <div className="flex-1">
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. demo"
                rows={3}
                required
              />
            </div>
          </div>

          {/* Scope */}
          <div className="flex items-start justify-between px-6 py-6 gap-8">
            <div className="flex-1">
              <label className="block font-medium mb-1">Scope</label>
              <p className="text-sm text-gray-500">Define the scope.</p>
            </div>
            <div className="flex-1">
              <input
                name="project_object_id"
                type="text"
                value={form.project_object_id}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 68b5d81b164cda2c73c45a08"
                required
              />
            </div>
          </div>

          {/* Version & Type & File */}
          <div className="flex items-start justify-between px-6 py-6 gap-8">
            <div className="flex-1">
              <label className="block font-medium mb-1">Version</label>
              <p className="text-sm text-gray-500">Blueprint version.</p>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-4">
              <input
                name="version"
                type="text"
                value={form.version}
                onChange={handleChange}
                className="col-span-1 w-full px-4 py-2 rounded border border-gray-200"
                placeholder="v1"
              />
              <input
                name="type"
                type="text"
                value={form.type}
                onChange={handleChange}
                className="col-span-1 w-full px-4 py-2 rounded border border-gray-200"
                placeholder="floor_plan"
              />
              <input
                name="blueprint_file"
                type="file"
                onChange={handleFileChange}
                className="col-span-1"
              />
            </div>
          </div>

          {/* Status (Badges) */}
          <div className="flex items-start justify-between px-6 py-6 gap-8">
            <div className="flex-1">
              <label className="block font-medium mb-1">Status</label>
              <p className="text-sm text-gray-500">
                Select the current status.
              </p>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-3">
                {statusOptions.map((status) => {
                  const isActive = form.status === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleStatusChange(status)}
                      className={`px-5 py-2 rounded-full font-medium text-sm transition 
                        ${
                          isActive
                            ? "bg-primary text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-6 py-4 text-red-600 text-sm">{error}</div>
          )}

          {/* Submit Button */}
          <div className="px-6 py-6">
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-white rounded-lg
               font-semibold hover:bg-black transition shadow-md"
            >
              Create Blueprint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
