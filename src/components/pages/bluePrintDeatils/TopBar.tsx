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
      <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Today</p>
          <h2 className="mt-2 text-4xl font-semibold leading-tight text-slate-900 md:text-[2.75rem]">Quantity Takeoff</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-base text-slate-500">• Operational view</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          {/* Version Dropdown */}
          {blueprintDetails?.versions && blueprintDetails.versions.length > 0 && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/70 px-4 py-2.5 text-sm font-medium text-slate-700 backdrop-blur transition hover:border-white hover:bg-white"
              >
                {currentVersionName ? `Version: ${currentVersionName}` : "Select Version"}
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 origin-top-right rounded-xl border border-white/50 bg-white/80 p-1 shadow-lg backdrop-blur-xl ring-1 ring-black/5 focus:outline-none z-50">
                  {blueprintDetails.versions.map((version: any) => (
                    <button
                      key={version._id}
                      onClick={() => {
                        setSelectedVersionId(version._id);
                        setIsOpen(false);
                        console.log("Selected Version ID:", version._id);
                        const params = new URLSearchParams(searchParams.toString());
                        params.set("versionId", version._id);
                        router.push(`?${params.toString()}`);
                      }}
                      className={`flex w-full uppercase items-center rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-white/50 ${selectedVersionId === version._id ? 'bg-white/50 font-semibold' : ''}`}
                    >
                      {version.version}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Edit Blueprint Button */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/70 px-4 py-2.5 text-sm font-medium text-slate-700 backdrop-blur transition hover:border-primary/30 hover:bg-white hover:text-primary"
            title="Edit Blueprint"
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </button>

          {/* Delete Blueprint Button */}
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/70 px-4 py-2.5 text-sm font-medium text-slate-700 backdrop-blur transition hover:border-red-500/30 hover:bg-white hover:text-red-500"
            title="Delete Blueprint"
          >
            <Trash2 className="w-4 h-4" />
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


