import React from "react";
import { Search, Clock3, X } from "lucide-react";

interface AiDetectionSidebarProps {
    detectionResults: any; // Ideally this should be typed properly based on your API response
    sidebarOpen: boolean;
    onClose: () => void;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onAddClassOpen: () => void;
    detectionTimestamp: any;
    filteredClasses: Record<string, any>;
    selectedClasses: Set<string>;
    onToggleClassSelection: (className: string) => void;
    onClearFilter: () => void;
    classCounts: Record<string, number>;
    customClasses: string[];
    getColorForClass: (className: string) => string;
}

export const AiDetectionSidebar: React.FC<AiDetectionSidebarProps> = ({
    detectionResults,
    sidebarOpen,
    onClose,
    searchTerm,
    onSearchChange,
    onAddClassOpen,
    detectionTimestamp,
    filteredClasses,
    selectedClasses,
    onToggleClassSelection,
    onClearFilter,
    classCounts,
    customClasses,
    getColorForClass,
}) => {
    if (!detectionResults || !sidebarOpen) return null;

    return (
        <div className="absolute w-96 top-16 right-0 z-10 bg-white bg-opacity-95 text-black rounded-lg py-4 px-5 max-w-sm h-screen overflow-y-auto shadow-2xl border border-gray-300">
            {/* Header can be uncommented if needed */}
            {/* <div className="flex items-center justify-between mb-4 pt-6">
            <h4 className="text-xl font-bold text-gray-800">
              Detection Results
            </h4>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div> */}

            {/* Search Bar */}
            <div className="relative mb-4">
                <div className="flex gap-2 items-center justify-between">
                    <div className="relative w-3/4 flex items-center">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search classes..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    </div>

                    <button
                        onClick={onAddClassOpen}
                        className="w-1/4 flex items-center justify-center gap-2 mb-4 px-2 py-2 mt-3 bg-black text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Class Breakdown */}
            {detectionResults.predictions && detectionResults.predictions.length > 0 && (
                <div className="mb-4">
                    {detectionTimestamp && (
                        <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-gray-500">
                            <span className="flex items-center gap-1">
                                <Clock3 className="h-3 w-3 text-gray-400" />
                                AI SNAPSHOT
                            </span>
                            <span className="tracking-normal font-semibold text-gray-600">
                                {detectionTimestamp.timeLabel} · {detectionTimestamp.dateLabel}
                            </span>
                        </div>
                    )}
                    <div className="space-y-1">
                        {Object.entries(filteredClasses).map(([className, stats]) => {
                            const isSelected = selectedClasses.has(className);
                            const classColor = getColorForClass(className);
                            const count = stats.count;

                            return (
                                <button
                                    key={className}
                                    onClick={() => onToggleClassSelection(className)}
                                    className="w-full flex items-center gap-3 px-3 py-2 border-t border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 bg-white"
                                >
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <div
                                            className="w-4 h-4 shadow-sm flex-shrink-0 rounded"
                                            style={{ backgroundColor: classColor }}
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-800 capitalize">
                                            <span>{className}</span>
                                            <span className="text-xs font-bold px-1 py-0.5 rounded-full bg-gray-100 border border-gray-300 text-black">
                                                {count}
                                            </span>
                                        </div>
                                    </div>

                                    <div
                                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isSelected
                                                ? "border-blue-500 bg-blue-500"
                                                : "border-gray-300 bg-white"
                                            }`}
                                    >
                                        {isSelected && (
                                            <svg
                                                className="w-2.5 h-2.5 text-white"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Clear Filter Button */}
                    {selectedClasses.size > 0 && (
                        <button
                            onClick={onClearFilter}
                            className="mt-3 w-full text-sm text-gray-600 hover:text-blue-600 underline py-1"
                        >
                            Clear filter (show all {Object.keys(classCounts).length} classes)
                        </button>
                    )}

                    {/* Summary Stats */}
                    <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Total Detections:</p>
                        <p className="text-lg font-bold text-gray-800">
                            {detectionResults.predictions.length}
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                            {Object.keys(classCounts).length} different classes detected
                        </p>
                    </div>

                    {/* Annotated Image Preview */}
                    {detectionResults.annotated_image && (
                        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                            <p className="text-xs text-gray-600 mb-2">
                                AI Annotated Preview:
                            </p>
                            <div className="relative">
                                <img
                                    src={detectionResults.annotated_image}
                                    alt="AI Annotated"
                                    className="w-full h-auto rounded border border-gray-300"
                                    style={{ maxHeight: "200px", objectFit: "contain" }}
                                />
                                <div className="absolute top-1 right-1 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                                    AI Processed
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Custom Classes Section */}
            {customClasses.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">
                        Custom Classes
                    </h5>
                    <div className="space-y-1">
                        {customClasses.map((className, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded text-sm"
                            >
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: getColorForClass(className) }}
                                ></div>
                                <span className="capitalize">{className}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
