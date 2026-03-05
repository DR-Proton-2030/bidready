/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useRef, useState } from "react";
import { File, ChevronDown, Share2, PanelLeft, Edit3, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import CreateVersionButton from "./CreateVersionButton";
import { EditBlueprintModal, DeleteBlueprintModal } from "@/components/shared";
import { toast } from "react-toastify";

interface TopBarProps {
  onToggleRightPanel: () => void;
  blueprintDetails?: any;
}

const TopBar: React.FC<TopBarProps> = ({
  onToggleRightPanel,
  blueprintDetails,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(searchParams.get("versionId"));
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const versionId = searchParams.get("versionId");
    if (versionId) {
      setSelectedVersionId(versionId);
    }
  }, [searchParams]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const currentVersionName = blueprintDetails?.versions?.find((v: any) => v._id === selectedVersionId)?.version;

  const handleEditSave = async (data: {
    name: string;
    description: string;
    type: string;
    status: string;
  }) => {
    setIsLoading(true);
    try {
      const blueprintId = blueprintDetails?.blueprint?._id;
      if (!blueprintId) {
        throw new Error("Blueprint ID not found");
      }

      const res = await fetch(`/api/blueprints/${blueprintId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update blueprint");
      }

      toast.success("Blueprint updated successfully!");
      router.refresh();
    } catch (error) {
      console.error("Failed to update blueprint:", error);
      toast.error("Failed to update blueprint");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /* Delete functionality */
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const blueprintId = blueprintDetails?.blueprint?._id;
      if (!blueprintId) {
        throw new Error("Blueprint ID not found");
      }

      const res = await fetch(`/api/blueprints/${blueprintId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete blueprint");
      }

      toast.success("Blueprint deleted successfully!");
      // Redirect to blueprints list
      router.push("/blueprints");
    } catch (error) {
      console.error("Failed to delete blueprint:", error);
      toast.error("Failed to delete blueprint");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        {/* Left side: Title area */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
              Quantity Takeoff
            </p>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            {blueprintDetails?.blueprint?.name || "Blueprint Details"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Operational overview &middot; {blueprintDetails?.total_images ?? 0} floors loaded
          </p>
        </div>

        {/* Right side: Actions */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Version Dropdown */}
          {blueprintDetails?.versions && blueprintDetails.versions.length > 0 && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:shadow-sm"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-100 text-[10px] font-bold text-indigo-600">
                  V
                </span>
                {currentVersionName || "Select Version"}
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-52 origin-top-right rounded-xl border border-slate-200 bg-white p-1 shadow-lg ring-1 ring-slate-900/5 focus:outline-none z-50">
                  {blueprintDetails.versions.map((version: any) => (
                    <button
                      key={version._id}
                      onClick={() => {
                        setSelectedVersionId(version._id);
                        setIsOpen(false);
                        const params = new URLSearchParams(searchParams.toString());
                        params.set("versionId", version._id);
                        router.push(`?${params.toString()}`);
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${selectedVersionId === version._id
                          ? "bg-slate-900 text-white font-medium"
                          : "text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                      <span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${selectedVersionId === version._id
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-500"
                        }`}>
                        V
                      </span>
                      <span className="uppercase">{version.version}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Edit Button */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:shadow-sm"
            title="Edit Blueprint"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>

          {/* Delete Button */}
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-red-200/80 bg-white px-3.5 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 hover:border-red-300"
            title="Delete Blueprint"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>

          <CreateVersionButton blueprintId={blueprintDetails?.blueprint?._id} />
        </div>
      </header>

      {/* Edit Blueprint Modal */}
      <EditBlueprintModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        blueprint={blueprintDetails?.blueprint || null}
        onSave={handleEditSave}
        isLoading={isLoading}
      />

      {/* Delete Blueprint Modal */}
      <DeleteBlueprintModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        blueprint={blueprintDetails?.blueprint || null}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  );
};



export default TopBar;


