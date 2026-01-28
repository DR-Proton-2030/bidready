"use client";

import React from "react";
import Modal from "../modal/Modal";
import { AlertTriangle, Trash2, X, FolderX } from "lucide-react";

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
            <div className="text-center py-2">
                {/* Animated Warning Icon */}
                <div className="relative mx-auto w-20 h-20 mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-rose-500 rounded-full opacity-20 animate-pulse"></div>
                    <div className="absolute inset-2 bg-gradient-to-br from-red-50 to-rose-100 rounded-full flex items-center justify-center">
                        <FolderX className="w-10 h-10 text-red-500" />
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Delete Project?
                </h3>

                {/* Project Name */}
                <p className="text-gray-500 mb-4">
                    You are about to delete
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl mb-4">
                    <span className="font-semibold text-gray-900 truncate max-w-[200px]">
                        {projectTitle}
                    </span>
                </div>

                {/* Warning Box */}
                <div className="flex items-start gap-3 text-left p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/60 rounded-xl mb-6">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-red-700 mb-1">
                            This action is irreversible
                        </p>
                        <p className="text-xs text-red-600/80">
                            All blueprints and associated data will be permanently deleted.
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="flex-1 px-6 py-3.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-rose-600 hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

