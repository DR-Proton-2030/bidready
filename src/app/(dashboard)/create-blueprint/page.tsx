"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = ["active", "completed", "on-hold", "in-progress"];

const CreateBlueprintPage: React.FC = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) return setError("Title is required");
    setLoading(true);
    try {
      const payload = { title, description, category, status };
      const res = await fetch("/api/blueprints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.message || "Failed to create blueprint");
      // navigate back to blueprints list
      router.push("/blueprints");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Create Blueprint</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-12 gap-4 items-start">
            <label className="col-span-3 text-sm text-gray-600">Title</label>
            <div className="col-span-9">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Blueprint title"
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 items-start">
            <label className="col-span-3 text-sm text-gray-600">
              Description
            </label>
            <div className="col-span-9">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded px-3 py-2 h-28"
                placeholder="A short description"
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 items-start">
            <label className="col-span-3 text-sm text-gray-600">Category</label>
            <div className="col-span-9">
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g. Electrical, Structural"
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 items-start">
            <label className="col-span-3 text-sm text-gray-600">Status</label>
            <div className="col-span-9 flex gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setStatus(opt)}
                  className={`px-3 py-1 rounded border ${
                    status === opt
                      ? "bg-sky-600 text-white"
                      : "bg-white text-gray-700"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="text-red-600">{error}</div>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-sky-600 text-white rounded disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Blueprint"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBlueprintPage;
