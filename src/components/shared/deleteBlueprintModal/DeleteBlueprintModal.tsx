"use client";

import React, { useState } from "react";
import Modal from "../modal/Modal";
import {
    AlertTriangle,
    Trash2,
    Loader2,
    X,
    FileImage,
    Layers
} from "lucide-react";

interface DeleteBlueprintModalProps {
    isOpen: boolean;
    onClose: () => void;
    blueprint: {
        _id?: string;
        name?: string;
    } | null;
    onConfirm: () => Promise<void>;
    isLoading?: boolean;
}

const DeleteBlueprintModal: React.FC<DeleteBlueprintModalProps> = ({
    isOpen,
    onClose,
    blueprint,
    onConfirm,
    isLoading = false,
}) => {
    const [confirmText, setConfirmText] = useState("");

    const blueprintName = blueprint?.name || "this blueprint";
    const isConfirmEnabled = confirmText.toLowerCase() === "delete";

    const handleClose = () => {
        setConfirmText("");
        onClose();
    };

    const handleConfirm = async () => {
        if (!isConfirmEnabled) return;
        await onConfirm();
        setConfirmText("");
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="" size="md">
            <div className="text-center">
                {/* Warning Icon */}
                <div className="mx-auto mb-6 relative">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-100 to-rose-50 rounded-full flex items-center justify-center">
                        <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 animate-pulse">
                            <AlertTriangle className="w-7 h-7 text-white" />
                        </div>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-200 rounded-full opacity-60"></div>
                    <div className="absolute -bottom-1 -left-3 w-3 h-3 bg-rose-300 rounded-full opacity-50"></div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Delete Blueprint?
                </h2>

                {/* Blueprint name */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl mb-4">
                    <FileImage className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-700">{blueprintName}</span>
                </div>

                {/* Warning message */}
                <p className="text-gray-500 mb-6">
                    This action <span className="font-semibold text-red-600">cannot be undone</span>.
                    This will permanently delete the blueprint and all associated data including:
                </p>

                {/* What will be deleted */}
                <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 mb-6 text-left">
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                            All blueprint images and floor plans
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                            All versions and version history
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                            All detection results and overlays
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                            All quantity takeoff data
                        </li>
                    </ul>
                </div>

                {/* Confirmation input */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                        Type <span className="font-bold text-red-600">delete</span> to confirm
                    </label>
                    <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Type 'delete' here"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-center"
                        disabled={isLoading}
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <X className="w-5 h-5" />
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isLoading || !isConfirmEnabled}
                        className="flex-1 px-6 py-3.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-5 h-5" />
                                Delete Blueprint
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteBlueprintModal;
