"use client";

import React, { useEffect, useState } from "react";
import Modal from "../modal/Modal";
import {
    FileText,
    AlignLeft,
    Tag,
    Activity,
    Check,
    Loader2,
    Save
} from "lucide-react";

interface EditBlueprintModalProps {
    isOpen: boolean;
    onClose: () => void;
    blueprint: {
        _id?: string;
        name?: string;
        description?: string;
        type?: string;
        status?: string;
    } | null;
    onSave: (data: {
        name: string;
        description: string;
        type: string;
        status: string;
    }) => Promise<void>;
    isLoading?: boolean;
}

const statusOptions = ["active", "draft", "archived", "in-progress"] as const;
const typeOptions = [
    { value: "structural", label: "Structural" },
    { value: "electrical", label: "Electrical" },
    { value: "plumbing", label: "Plumbing" },
    { value: "architectural", label: "Architectural" },
    { value: "mechanical", label: "Mechanical" },
    { value: "other", label: "Other" },
];

const statusColors: Record<string, { bg: string; activeBg: string; text: string }> = {
    active: {
        bg: "bg-emerald-50 border-emerald-200 text-emerald-700",
        activeBg: "bg-gradient-to-r from-emerald-500 to-green-500 text-white border-transparent shadow-lg shadow-emerald-500/25",
        text: "Active",
    },
    draft: {
        bg: "bg-gray-50 border-gray-200 text-gray-700",
        activeBg: "bg-gradient-to-r from-gray-500 to-slate-500 text-white border-transparent shadow-lg shadow-gray-500/25",
        text: "Draft",
    },
    archived: {
        bg: "bg-amber-50 border-amber-200 text-amber-700",
        activeBg: "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-lg shadow-amber-500/25",
        text: "Archived",
    },
    "in-progress": {
        bg: "bg-blue-50 border-blue-200 text-blue-700",
        activeBg: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-transparent shadow-lg shadow-blue-500/25",
        text: "In Progress",
    },
};

const EditBlueprintModal: React.FC<EditBlueprintModalProps> = ({
    isOpen,
    onClose,
    blueprint,
    onSave,
    isLoading = false,
}) => {
    const [form, setForm] = useState({
        name: "",
        description: "",
        type: "other",
        status: "active" as typeof statusOptions[number],
    });
    const [error, setError] = useState("");

    useEffect(() => {
        if (blueprint && isOpen) {
            setForm({
                name: blueprint.name || "",
                description: blueprint.description || "",
                type: blueprint.type || "other",
                status: (blueprint.status as typeof statusOptions[number]) || "active",
            });
            setError("");
        }
    }, [blueprint, isOpen]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleStatusChange = (status: typeof statusOptions[number]) => {
        setForm({ ...form, status });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            setError("Blueprint name is required.");
            return;
        }
        setError("");
        try {
            await onSave(form);
            onClose();
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Failed to update blueprint";
            setError(message);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Blueprint" size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Display */}
                {error && (
                    <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/60 rounded-xl text-red-600 text-sm">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        {error}
                    </div>
                )}

                {/* Name */}
                <div>
                    <label className="flex items-center gap-2 font-medium text-gray-900 mb-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Blueprint Name
                    </label>
                    <input
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-100 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200"
                        placeholder="e.g. Floor Plan - Level 1"
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="flex items-center gap-2 font-medium text-gray-900 mb-2">
                        <AlignLeft className="w-4 h-4 text-primary" />
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-100 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200 resize-none"
                        placeholder="Brief description of the blueprint..."
                        rows={3}
                    />
                </div>

                {/* Type */}
                <div>
                    <label className="flex items-center gap-2 font-medium text-gray-900 mb-2">
                        <Tag className="w-4 h-4 text-primary" />
                        Blueprint Type
                    </label>
                    <select
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-100 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200 cursor-pointer appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                    >
                        {typeOptions.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Status */}
                <div>
                    <label className="flex items-center gap-2 font-medium text-gray-900 mb-3">
                        <Activity className="w-4 h-4 text-primary" />
                        Status
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {statusOptions.map((status) => {
                            const isActive = form.status === status;
                            const colors = statusColors[status];
                            return (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => handleStatusChange(status)}
                                    className={`relative px-4 py-3 rounded-xl font-medium text-sm border transition-all duration-300 flex items-center justify-center gap-2
                    ${isActive ? colors.activeBg : colors.bg}
                    hover:scale-[1.02]
                  `}
                                >
                                    {isActive && (
                                        <Check className="w-4 h-4" />
                                    )}
                                    {colors.text}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
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
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditBlueprintModal;
