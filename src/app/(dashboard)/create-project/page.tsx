"use client";

import React, { useState } from "react";
import { useProjects } from "@/hooks/useProjects/useProjects";
import { useRouter } from "next/navigation";

const statusOptions = ["active", "completed", "on-hold", "in-progress"];

export default function CreateProjectPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    scope: "",
    status: "active",
  });
  const [error, setError] = useState("");
  const { handleNewProject } = useProjects();
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (status: string) => {
    setForm({ ...form, status });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.scope) {
      setError("All fields are required.");
      return;
    }
    setError("");
    (async () => {
      try {
        await handleNewProject(form);
        // success - navigate to projects list
        router.push("/projects");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to create project";
        setError(message);
      }
    })();
  };

  return (
    <div className=" bg-white flex py-5 border-t border-gray-200 shadow-md rounded-xl w-full  px-6">
      <div className="bg-white  w-[80%]">
        <h2 className="px-6 pt-6 pb-3 text-3xl font-semibold ">
          Create Project
        </h2>
        <p className="px-6 pb-6 text-sm text-gray-500 border-b border-gray-200">
          Enter the name of your project. This will be your primary identifier.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio.
        </p>
        <form onSubmit={handleSubmit} className="divide-y divide-gray-100  ">
          {/* Title */}
          <div className="flex items-start justify-between px-6 py-6 gap-8">
            <div className="flex-1">
              <label className="block font-medium mb-1">Project title</label>
              <p className="text-sm text-gray-500">
                Enter the name of your project. This will be your primary
                identifier.
              </p>
            </div>
            <div className="flex-1">
              <input
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Marketing Dashboard"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex items-start justify-between px-6 py-6 gap-8">
            <div className="flex-1">
              <label className="block font-medium mb-1">Description</label>
              <p className="text-sm text-gray-500">
                Provide a brief description of the project.
              </p>
            </div>
            <div className="flex-1">
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. A tool to monitor KPIs and sales performance..."
                rows={3}
                required
              />
            </div>
          </div>

          {/* Scope */}
          <div className="flex items-start justify-between px-6 py-6 gap-8">
            <div className="flex-1">
              <label className="block font-medium mb-1">Scope</label>
              <p className="text-sm text-gray-500">
                Define the scope of your project.
              </p>
            </div>
            <div className="flex-1">
              <input
                name="scope"
                type="text"
                value={form.scope}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Marketing team only, Q1 goals..."
                required
              />
            </div>
          </div>

          {/* Status (Badges) */}
          <div className="flex items-start justify-between px-6 py-6 gap-8">
            <div className="flex-1">
              <label className="block font-medium mb-1">Status</label>
              <p className="text-sm text-gray-500">
                Select the current status of your project.
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
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
