
import React from "react";
import { ZoomIn, ZoomOut, RotateCw, Download, Save } from "lucide-react";
import AiButton from "./aiButton/AiButton";

interface FullScreenImageHeaderProps {
    currentImageName: string;
    zoom: number;
    onZoomOut: () => void;
    onZoomIn: () => void;
    onRotate: () => void;
    onResetView: () => void;
    showDimensions: boolean;
    onToggleDimensions: () => void;
    onAskAiOpen: () => void;
    onExportCsv: () => void;
    onClose: () => void;
    polygonPointsLength: number;
    onFinishPolygon: () => void;
    onCancelPolygon: () => void;
}

export const FullScreenImageHeader: React.FC<FullScreenImageHeaderProps> = ({
    currentImageName,
    zoom,
    onZoomOut,
    onZoomIn,
    onRotate,
    onResetView,
    showDimensions,
    onToggleDimensions,
    onAskAiOpen,
    onExportCsv,
    onClose,
    polygonPointsLength,
    onFinishPolygon,
    onCancelPolygon,
}) => {
    return (
        <div className="absolute top-0 left-0 right-0 z-50 bg-[#1C2931] bg-opacity-50 px-4 py-4">
            <div className="flex items-center justify-between text-white">
                <div className="flex-1">
                    <h3 className="text-sm font-medium truncate max-w-md">
                        {currentImageName} Blue Print
                    </h3>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onZoomOut}
                        className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                        title="Zoom Out (-)"
                    >
                        <ZoomOut className="w-5 h-5" />
                    </button>

                    <span className="text-sm px-2">{Math.round(zoom * 100)}%</span>

                    <button
                        onClick={onZoomIn}
                        className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                        title="Zoom In (+)"
                    >
                        <ZoomIn className="w-5 h-5" />
                    </button>

                    <button
                        onClick={onRotate}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Rotate (R)"
                    >
                        <RotateCw className="w-5 h-5" />
                    </button>

                    <button
                        onClick={onResetView}
                        className="px-3 py-1 text-md  hover:bg-gray-700 mr-2 transition-colors"
                        title="Reset View"
                    >
                        Reset
                    </button>

                    <button
                        onClick={onToggleDimensions}
                        className={`px-5 py- flex justify-center  bg-gradient-to-r from-gray-700/60 to-green-800/10 items-center gap-2 text-white/70 hover:bg-green-600/40
               h-12 px-8 rounded-lg border-2 border-white/10 overflow-hidden transition-all duration-500 group shadow  transition-colors ${showDimensions ? "bg-purple-500 text-white" : "bg-gray-700 text-white"
                            }`}
                        title={showDimensions ? "Hide Dimensions" : "Show Dimensions"}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M3 3h18v18H3z" />
                            <path d="M9 3v18" />
                            <path d="M15 3v18" />
                            <path d="M3 9h18" />
                            <path d="M3 15h18" />
                        </svg>
                        Show Dimentions
                    </button>

                    <AiButton onClick={onAskAiOpen} />
                    <button
                        onClick={onExportCsv}
                        className="px-5 py-2 flex justify-center  bg-gradient-to-r from-gray-700/60 to-green-800/10 items-center gap-2 text-white/70 hover:bg-green-600/40
               h-12 px-8 rounded-lg border-2 border-white/10 overflow-hidden transition-all duration-500 group shadow  transition-colors"
                        title="Export Annotations CSV"
                    >
                        <Download size={18} /> Download
                    </button>
                    <button
                        onClick={onClose}
                        className="px-5 py-2 flex justify-center  bg-gradient-to-r from-gray-700/60 to-green-800/10 items-center gap-2 text-white/70 hover:bg-green-600/40
               h-12 px-8 rounded-lg border-2 border-white/10 overflow-hidden transition-all duration-500 group shadow  transition-colors"
                        title="Close Viewer"
                    >
                        <Save size={18} className="text-white/60" /> Save
                    </button>

                    {/* Polygon finish/cancel controls */}
                    {polygonPointsLength > 0 && (
                        <div className="flex items-center space-x-2 ml-2">
                            <button
                                onClick={onFinishPolygon}
                                className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Finish Polygon
                            </button>
                            <button
                                onClick={onCancelPolygon}
                                className="px-3 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
