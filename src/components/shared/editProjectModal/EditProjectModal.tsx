"use client";

import React, { useState, useEffect } from "react";
import Modal from "../modal/Modal";
import { IProject } from "@/@types/interface/project.interface";

interface EditProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: IProject;
    onSave: (data: Partial<IProject>) => Promise<void>;
    isLoading?: boolean;
}

const statusOptions: Array<"active" | "completed" | "on-hold" | "in-progress"> = ["active", "completed", "on-hold", "in-progress"];

const EditProjectModal: React.FC<EditProjectModalProps> = ({
    isOpen,
    onClose,
    project,
    onSave,
    isLoading = false,
}) => {
    const [form, setForm] = useState({
        title: "",
        description: "",
        scope: "",
        status: "active" as "active" | "completed" | "on-hold" | "in-progress",
    });
    const [error, setError] = useState("");

    useEffect(() => {
        if (project && isOpen) {
            setForm({
                title: project.title || "",
                description: project.description || "",
                scope: project.scope || "",
                status: project.status || "active",
            });
            setError("");
        }
    }, [project, isOpen]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleStatusChange = (status: "active" | "completed" | "on-hold" | "in-progress") => {
        setForm({ ...form, status });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.description || !form.scope) {
            setError("All fields are required.");
            return;
        }
        setError("");
        try {
            await onSave(form);
            onClose();
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Failed to update project";
            setError(message);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Project" size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                    <label className="block font-medium text-gray-900 mb-2">
                        Project Title
                    </label>
                    <input
                        name="title"
                        type="text"
                        value={form.title}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        placeholder="e.g. Marketing Dashboard"
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block font-medium text-gray-900 mb-2">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                        placeholder="e.g. A tool to monitor KPIs and sales performance..."
                        rows={4}
                        required
                    />
                </div>

                {/* Scope */}
                <div>
                    <label className="block font-medium text-gray-900 mb-2">Scope</label>
                    <input
                        name="scope"
                        type="text"
                        value={form.scope}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        placeholder="e.g. Marketing team only, Q1 goals..."
                        required
                    />
                </div>

                {/* Status */}
                <div>
                    <label className="block font-medium text-gray-900 mb-3">Status</label>
                    <div className="flex flex-wrap gap-3">
                        {statusOptions.map((status) => {
                            const isActive = form.status === status;
                            return (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => handleStatusChange(status)}
                                    className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-200
                    ${isActive
                                            ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102"
                                        }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg
                                    className="animate-spin h-5 w-5"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditProjectModal;
