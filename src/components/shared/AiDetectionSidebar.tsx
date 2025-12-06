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
        <div className="absolute right-4 top-24 w-80 h-[80vh] 
        overflow-y-auto z-40 bg-white/60 backdrop-blur-xl border-2 border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.20)] 
        rounded-2xl p-4 flex flex-col gap-4 animate-in slide-in-from-right-8 fade-in duration-300 custom-scrollbar">

            {/* Header / Search Section */}
            <div className="flex gap-2 items-center">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search classes..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-white/50 border border-gray-200/60 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all shadow-sm"
                    />
                </div>

                <button
                    onClick={onAddClassOpen}
                    className="flex items-center justify-center w-10 h-10 bg-black/70 text-white 
                    rounded-xl hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-md shadow-gray-200"
                    title="Add New Class"
                >
                    <span className="text-lg font-medium leading-none mb-0.5">+</span>
                </button>
            </div>

            {/* Main Content Area */}
            {detectionResults.predictions && detectionResults.predictions.length > 0 && (
                <div className="flex flex-col gap-4">

                    {/* Timestamp Badge */}
                    {detectionTimestamp && (
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/40 border border-white/50 text-[10px] uppercase tracking-wider font-bold text-gray-500 shadow-sm">
                                <Clock3 className="h-3 w-3" />
                                <span>AI Snapshot</span>
                            </div>
                            <span className="text-[10px] font-semibold text-gray-400 tracking-tight">
                                {detectionTimestamp.timeLabel}
                            </span>
                        </div>
                    )}

                    {/* Class List */}
                    <div className="flex flex-col gap-1.5">
                        {Object.entries(filteredClasses).map(([className, stats]) => {
                            const isSelected = selectedClasses.has(className);
                            const classColor = getColorForClass(className);
                            const count = stats.count;

                            return (
                                <button
                                    key={className}
                                    onClick={() => onToggleClassSelection(className)}
                                    className={`
                    group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200
                    ${isSelected
                                            ? "bg-blue-50/80 border-blue-100 shadow-sm shadow-blue-100"
                                            : "bg-white/40 border-transparent hover:bg-white hover:border-white/60 hover:shadow-sm"
                                        }
                  `}
                                >
                                    {/* Color Dot */}
                                    <div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
                                        <div
                                            className={`w-3 h-3 rounded-full shadow-sm ring-2 ring-white transition-transform duration-300 ${isSelected ? "scale-110" : "scale-100"}`}
                                            style={{ backgroundColor: classColor }}
                                        />
                                    </div>

                                    {/* Label & Count */}
                                    <div className="flex-1 flex items-center justify-between min-w-0">
                                        <span className={`text-sm font-semibold capitalize truncate pr-2 ${isSelected ? "text-blue-900" : "text-gray-700"}`}>
                                            {className}
                                        </span>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border min-w-[1.25rem] text-center ${isSelected ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                                            {count}
                                        </span>
                                    </div>

                                    {/* Checkbox UI */}
                                    <div
                                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-200 ${isSelected
                                            ? "border-blue-500 bg-blue-500 scale-100"
                                            : "border-gray-300 bg-transparent scale-90 opacity-0 group-hover:opacity-100"
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

                    {/* Clear Filter Action */}
                    {selectedClasses.size > 0 && (
                        <button
                            onClick={onClearFilter}
                            className="text-xs font-semibold text-gray-500 hover:text-blue-600 hover:underline transition-all self-center"
                        >
                            Clear filter (Show all {Object.keys(classCounts).length} classes)
                        </button>
                    )}

                    {/* Stats Card */}
                    <div className="bg-gradient-to-br from-gray-50 to-white border border-white/60 p-3 rounded-xl shadow-sm">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Total Detections</p>
                                <p className="text-2xl font-bold text-gray-800 leading-none">{detectionResults.predictions.length}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Classes</p>
                                <p className="text-xl font-bold text-gray-700 leading-none">{Object.keys(classCounts).length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Annotated Preview Card */}
                    {detectionResults.annotated_image && (
                        <div className="group relative overflow-hidden rounded-xl border border-white/60 shadow-sm bg-gray-50">
                            <img
                                src={detectionResults.annotated_image}
                                alt="AI Annotated"
                                className="w-full h-32 object-cover object-center opacity-90 group-hover:opacity-100 transition-opacity"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 pointer-events-none" />
                            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                                <span className="text-[10px] font-bold text-white/90 bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20">
                                    Preview
                                </span>
                                <span className="bg-green-500/90 backdrop-blur text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm border border-white/20">
                                    AI PROCESSED
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Custom Classes Section */}
            {customClasses.length > 0 && (
                <div className="pt-3 border-t border-gray-200/50 mt-1">
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Custom Classes
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                        {customClasses.map((className, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/60 border border-gray-100 rounded-lg text-xs font-medium text-gray-600 shadow-sm"
                            >
                                <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: getColorForClass(className) }}
                                ></span>
                                <span className="capitalize">{className}</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
