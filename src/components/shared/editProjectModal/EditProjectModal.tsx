"use client";

import React, { useState, useEffect } from "react";
import Modal from "../modal/Modal";
import { IProject } from "@/@types/interface/project.interface";
import { FileText, AlignLeft, Target, Activity, Check } from "lucide-react";

interface EditProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: IProject;
    onSave: (data: Partial<IProject>) => Promise<void>;
    isLoading?: boolean;
}

const statusOptions: Array<{
    value: "active" | "completed" | "on-hold" | "in-progress";
    label: string;
    color: string;
    bgColor: string;
    gradient: string;
}> = [
        { value: "active", label: "Active", color: "text-emerald-600", bgColor: "bg-emerald-50", gradient: "from-emerald-400 to-emerald-500" },
        { value: "completed", label: "Completed", color: "text-blue-600", bgColor: "bg-blue-50", gradient: "from-blue-400 to-blue-500" },
        { value: "on-hold", label: "On Hold", color: "text-amber-600", bgColor: "bg-amber-50", gradient: "from-amber-400 to-amber-500" },
        { value: "in-progress", label: "In Progress", color: "text-purple-600", bgColor: "bg-purple-50", gradient: "from-purple-400 to-purple-500" },
    ];

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
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <div className="group">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Project Title
                    </label>
                    <input
                        name="title"
                        type="text"
                        value={form.title}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                        placeholder="Enter project title..."
                        required
                    />
                </div>

                {/* Description */}
                <div className="group">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <AlignLeft className="w-4 h-4 text-primary" />
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 resize-none"
                        placeholder="Describe your project..."
                        rows={3}
                        required
                    />
                </div>

                {/* Scope */}
                <div className="group">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Target className="w-4 h-4 text-primary" />
                        Scope
                    </label>
                    <input
                        name="scope"
                        type="text"
                        value={form.scope}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                        placeholder="Define project scope..."
                        required
                    />
                </div>

                {/* Status */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                        <Activity className="w-4 h-4 text-primary" />
                        Status
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {statusOptions.map((option) => {
                            const isActive = form.status === option.value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleStatusChange(option.value)}
                                    className={`relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${isActive
                                            ? `bg-gradient-to-r ${option.gradient} text-white shadow-lg scale-[1.02]`
                                            : `${option.bgColor} ${option.color} hover:scale-[1.02] border-2 border-transparent hover:border-gray-200`
                                        }`}
                                >
                                    {isActive && (
                                        <Check className="w-4 h-4" />
                                    )}
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="px-4 py-3 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 px-6 py-3.5 bg-gradient-to-r from-primary to-orange-500 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                            <>
                                <Check className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditProjectModal;

