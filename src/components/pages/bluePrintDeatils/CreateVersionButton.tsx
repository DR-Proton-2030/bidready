"use client";
import React, { useState } from "react";
import { Upload, X } from "lucide-react";

import useCreateVersion from "@/hooks/useCreateVersion";
import { useRouter } from "next/navigation";

const CreateVersionModal: React.FC<{ isOpen: boolean; onClose: () => void; blueprintId: string }> = ({
    isOpen,
    onClose,
    blueprintId
}) => {
    const [file, setFile] = useState<File | null>(null);
    const { createVersionWithStreaming, isUploading, isStreaming, streamingProgress } = useCreateVersion();
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleCreate = async () => {
        if (!file || !blueprintId) return;

        const formData = new FormData();
        formData.append("blueprint_file", file);
        // formData.append("version", "v2"); // Backend auto-increments if not provided
        // formData.append("description", "New version");

        try {
            await createVersionWithStreaming(blueprintId, formData, {
                onComplete: (data) => {
                    console.log("Version created:", data);
                    onClose();
                    setFile(null);
                    router.refresh();
                },
                onError: (err) => {
                    console.error("Upload failed:", err);
                    // alert("Failed to upload version. Please try again.");
                }
            });
        } catch (e) {
            console.error(e);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={!isUploading ? onClose : undefined}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/50 bg-white/90 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-slate-900">Create New Version</h3>
                    <button
                        onClick={onClose}
                        disabled={isUploading}
                        className="rounded-full p-2 text-slate-500 hover:bg-slate-100 transition disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 px-6 py-10 transition hover:bg-slate-50">
                        <Upload className="h-10 w-10 text-slate-400 mb-3" />
                        {file ? (
                            <div className="text-center">
                                <p className="text-sm font-medium text-slate-900">{file.name}</p>
                                <p className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm font-medium text-slate-900">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    SVG, PNG, JPG, PDF (max. 10MB)
                                </p>
                            </>
                        )}
                        <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg,.svg"
                            onChange={handleFileChange}
                            disabled={isUploading}
                            className="absolute inset-0 cursor-pointer opacity-0"
                        />
                    </div>

                    {isUploading && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-4">
                            <div className="bg-slate-600 h-2.5 rounded-full" style={{ width: `${streamingProgress}%` }}></div>
                            <p className="text-xs text-center mt-1 text-slate-500">{isStreaming ? `Processing... ${streamingProgress}%` : 'Uploading...'}</p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={onClose}
                            disabled={isUploading}
                            className="rounded-xl border border-slate-200 hover:bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 disabled:opacity-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={!file || isUploading}
                            className="rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUploading ? "Creating..." : "Create Version"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function CreateVersionButton({ blueprintId }: { blueprintId: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5"
            >
                Create New Version
            </button>

            <CreateVersionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                blueprintId={blueprintId}
            />
        </>
    );
}
