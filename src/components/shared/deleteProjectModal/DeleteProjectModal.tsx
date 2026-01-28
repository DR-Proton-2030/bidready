"use client";

import React from "react";
import Modal from "../modal/Modal";
import { AlertTriangle, Trash2 } from "lucide-react";

interface DeleteProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectTitle: string;
    onConfirm: () => Promise<void>;
    isLoading?: boolean;
}

const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
    isOpen,
    onClose,
    projectTitle,
    onConfirm,
    isLoading = false,
}) => {
    const handleDelete = async () => {
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            console.error("Failed to delete project:", error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" size="sm" showCloseButton={false}>
            <div className="text-center">
                {/* Warning Icon */}
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Delete Project?
                </h3>

                {/* Description */}
                <p className="text-gray-500 mb-2">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-gray-900">&quot;{projectTitle}&quot;</span>?
                </p>
                <p className="text-sm text-red-500 bg-red-50 py-2 px-4 rounded-lg mb-6">
                    This action cannot be undone. All blueprints associated with this project will also be deleted.
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all shadow-lg shadow-red-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-5 h-5" />
                                Delete Project
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteProjectModal;
