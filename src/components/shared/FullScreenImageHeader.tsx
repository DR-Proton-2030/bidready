import React, { useState } from "react";
import { ZoomIn, ZoomOut, RotateCw, Download, X, Check, Ruler, Minimize2, LayoutTemplate, PanelTop, Save, Image, ScanSearch } from "lucide-react";
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
    onRunDeepScan: () => void;
    isScanning: boolean;
}

export const FullScreenImageHeader: React.FC<FullScreenImageHeaderProps> = (props) => {
    const [isFloating, setIsFloating] = useState(true);

    const {
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
        onRunDeepScan,
        isScanning,
    } = props;

    const ToggleButton = () => (
        <button
            onClick={() => setIsFloating(!isFloating)}
            className={`p-2 rounded-lg transition-all duration-200 active:scale-95 ${isFloating
                ? "text-gray-500 hover:text-gray-900 hover:bg-white"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
            title={isFloating ? "Switch to Fixed Header" : "Switch to Floating Header"}
        >
            {isFloating ? <LayoutTemplate size={18} /> : <PanelTop size={18} />}
        </button>
    );

    // --- FLOATING MODERN HEADER ---
    if (isFloating) {
        return (
            <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none p-4 md:p-">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 max-w-[1920px] mx-auto">

                    {/* Left Floating Island: Identity */}
                    <div className="pointer-events-auto flex items-center gap-3  backdrop-blur-xl 
                    border border-white/60 overflow-hidden shadow-xl shadow-black/5 rounded-2xl p-2 pr-5 transition-all bg-white/80">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-600 to-orange-400 
                        flex items-center justify-center text-orange-600 shadow-sm">
                            <Image size={20} className="drop-shadow-sm text-white" />
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-gray-900 font-bold text-sm tracking-tight truncate max-w-[170px] leading-tight">
                                {currentImageName}
                            </h3>
                            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                                Blueprint View
                            </span>
                        </div>
                    </div>

                    {/* Right Floating Island: Controls */}
                    <div className="pointer-events-auto flex items-center gap-2 bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl shadow-black/5 rounded-2xl p-2 ml-auto">

                        {/* Zoom Group */}
                        <div className="flex items-center bg-gray-100/50 rounded-xl p-1 gap-1 border border-black/5">
                            <button
                                onClick={onZoomOut}
                                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200 active:scale-95"
                                title="Zoom Out"
                            >
                                <ZoomOut size={18} />
                            </button>
                            <span className="text-xs font-bold text-gray-700 w-12 text-center tabular-nums">
                                {Math.round(zoom * 100)}%
                            </span>
                            <button
                                onClick={onZoomIn}
                                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200 active:scale-95"
                                title="Zoom In"
                            >
                                <ZoomIn size={18} />
                            </button>
                        </div>

                        <div className="w-[1px] h-8 bg-gray-200/60 mx-1 hidden sm:block" />

                        {/* Tools Group */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={onRotate}
                                className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-xl transition-all duration-200 active:scale-95 hover:shadow-sm"
                                title="Rotate"
                            >
                                <RotateCw size={18} />
                            </button>

                            <button
                                onClick={onResetView}
                                className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-xl transition-all duration-200 active:scale-95 hover:shadow-sm"
                                title="Reset View"
                            >
                                <Minimize2 size={18} />
                            </button>

                            <button
                                onClick={onToggleDimensions}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${showDimensions
                                    ? "bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-200"
                                    : "hover:bg-white/50 text-gray-600 border-transparent bg-white shadow-sm"
                                    }`}
                            >
                                <Ruler size={16} className={showDimensions ? "text-white" : "text-gray-500"} />
                                <span className="hidden sm:inline">Dimensions</span>
                            </button>
                        </div>

                        <div className="w-[1px] h-8 bg-gray-200/60 mx-1 hidden sm:block" />

                        {/* AI & Actions & Toggle */}
                        <div className="flex items-center gap-2">
                            <div className="transform hover:scale-105 transition-transform duration-200">
                                <AiButton onClick={onAskAiOpen} />
                            </div>

                            <button
                                onClick={onRunDeepScan}
                                disabled={isScanning}
                                className={`p-2.5 rounded-xl transition-all duration-200 hover:shadow-sm ${isScanning
                                    ? "bg-indigo-100 text-indigo-500 cursor-not-allowed"
                                    : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/80"}`}
                                title="Run Deep Scan for Calibration"
                            >
                                {isScanning ? (
                                    <div className="w-[18px] h-[18px] border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <ScanSearch size={18} />
                                )}
                            </button>

                            <ToggleButton />

                            <button
                                onClick={onExportCsv}
                                className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-xl transition-all duration-200 hover:shadow-sm"
                                title="Export CSV"
                            >
                                <Download size={18} />
                            </button>

                            <button
                                onClick={onClose}
                                className="group flex items-center justify-center w-9 h-9 sm:w-auto sm:px-4 
                                sm:h-10 bg-green-700 text-white rounded-xl shadow-lg shadow-gray-200 hover:bg-green-800 
                                hover:scale-105 active:scale-95 transition-all duration-200"
                                title="Save"
                            >
                                <Save size={18} className=" transition-transform duration-300" />
                                <span className="hidden sm:inline ml-2 text-xs font-bold">Save</span>
                            </button>
                        </div>
                    </div>

                    {/* Floating Contextual Actions (Polygon) */}
                    {polygonPointsLength > 0 && (
                        <div className="pointer-events-auto absolute top-24 right-4 md:right-6 flex flex-col gap-2 animate-in slide-in-from-right-8 fade-in duration-300">
                            <div className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl p-3 rounded-2xl flex items-center gap-3">
                                <div className="flex items-center gap-2 px-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                    </span>
                                    <span className="text-xs font-bold text-gray-700">Polygon Active</span>
                                </div>
                                <div className="h-6 w-[1px] bg-gray-200" />
                                <div className="flex gap-2">
                                    <button
                                        onClick={onFinishPolygon}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95"
                                    >
                                        <Check size={14} strokeWidth={3} /> Finish
                                    </button>
                                    <button
                                        onClick={onCancelPolygon}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200 transition-all active:scale-95"
                                    >
                                        <X size={14} strokeWidth={3} /> Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        );
    }

    // --- FIXED CLASSIC HEADER ---
    return (
        <div className="absolute top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
            <div className="flex items-center justify-between px-6 py-3 gap-4">

                {/* Left Section: Title & Identity */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex gap-3 items-center">
                        <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center border border-orange-200 text-orange-600">
                            <Ruler size={18} />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h3 className="text-gray-900 font-semibold text-sm truncate max-w-xs sm:max-w-md leading-tight">
                                {currentImageName}
                            </h3>
                            <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">
                                Blueprint Inspection
                            </span>
                        </div>
                    </div>
                </div>

                {/* Center/Right Section: Controls */}
                <div className="flex items-center gap-3">

                    <div className="hidden md:flex items-center bg-gray-50 rounded-lg p-1 gap-1 border border-gray-200 shadow-sm">
                        <button onClick={onZoomOut} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-md transition-all duration-200" title="Zoom Out">
                            <ZoomOut size={16} />
                        </button>
                        <span className="text-xs font-semibold text-gray-600 w-10 text-center select-none tabular-nums">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button onClick={onZoomIn} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-md transition-all duration-200" title="Zoom In">
                            <ZoomIn size={16} />
                        </button>
                        <div className="w-[1px] h-4 bg-gray-200 mx-1" />
                        <button onClick={onRotate} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-md transition-all duration-200" title="Rotate">
                            <RotateCw size={16} />
                        </button>
                        <button onClick={onResetView} className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-gray-900 hover:bg-white rounded-md transition-all duration-200" title="Reset View">
                            Reset
                        </button>
                    </div>

                    <div className="h-6 w-[1px] bg-gray-200 mx-2 hidden md:block" />

                    <button
                        onClick={onToggleDimensions}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 border shadow-sm ${showDimensions
                            ? "bg-orange-50 text-orange-700 border-orange-200 ring-1 ring-orange-200/50"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                            }`}
                    >
                        <Ruler size={14} className={showDimensions ? "text-orange-600" : "text-gray-400"} />
                        <span className="hidden sm:inline">Dimensions</span>
                    </button>

                    <div className="transform scale-95">
                        <AiButton onClick={onAskAiOpen} />
                    </div>

                    <button
                        onClick={onRunDeepScan}
                        disabled={isScanning}
                        className={`p-2 rounded-lg transition-all duration-200 ${isScanning
                            ? "bg-indigo-50 text-indigo-500 cursor-not-allowed"
                            : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"}`}
                        title="Run Deep Scan for Calibration"
                    >
                        {isScanning ? (
                            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <ScanSearch size={16} />
                        )}
                    </button>

                    <div className="h-6 w-[1px] bg-gray-200 mx-1 hidden md:block" />

                    <ToggleButton />

                    <button onClick={onExportCsv} className="p-2 sm:px-3 sm:py-2 flex items-center gap-2 rounded-lg text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm transition-all" title="Export CSV">
                        <Download size={16} />
                        <span className="hidden lg:inline">Export</span>
                    </button>

                    <button onClick={onClose} className="p-2 sm:px-4 sm:py-2 flex items-center gap-2 rounded-lg text-xs font-semibold text-white bg-gray-900 border border-transparent hover:bg-black shadow transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0" title="Done">
                        <span className="hidden sm:inline">Done</span>
                        <X size={16} className="sm:hidden" />
                        <Check size={16} className="hidden sm:inline" />
                    </button>
                </div>

                {polygonPointsLength > 0 && (
                    <div className="absolute top-20 right-6 flex items-center gap-2 bg-white/95 backdrop-blur p-1.5 pr-3 rounded-full shadow-2xl border border-gray-100 animate-in fade-in slide-in-from-top-4 z-[60]">
                        <div className="pl-3 pr-2 text-xs font-semibold text-gray-500">
                            Drawing Polygon...
                        </div>
                        <button onClick={onFinishPolygon} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500 text-white text-xs font-bold hover:bg-green-600 shadow-sm transition-colors">
                            <Check size={12} strokeWidth={3} /> Finish
                        </button>
                        <button onClick={onCancelPolygon} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200 hover:text-gray-900 transition-colors">
                            <X size={12} strokeWidth={3} /> Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
