'use client'
import React, { useState } from 'react';
import { X, Layers, Upload, Copy, Move, RotateCw, RefreshCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Minus, Plus, Hand, Crop, ChevronDown, ChevronRight, Palette } from 'lucide-react';
import { useRef } from 'react';

interface Image {
    id: string;
    name: string;
    path: string;
    pageNumber?: number;
}

interface OverlayControlPanelProps {
    isOpen: boolean;
    onClose: () => void;
    images: Image[];
    selectedOverlayId: string | null;
    onSelectOverlay: (imageId: string) => void;
    opacity: number;
    onOpacityChange: (opacity: number) => void;
    blendMode: string;
    onBlendModeChange: (mode: string) => void;
    onUpload?: (file: File) => void;
    onCopyCurrent?: () => void;
    offset: { x: number; y: number };
    onOffsetChange: (offset: { x: number; y: number }) => void;
    scale: number;
    onScaleChange: (scale: number) => void;
    rotation: number;
    onRotationChange: (rotation: number) => void;
    isInteractive: boolean;
    onToggleInteraction: () => void;
    onCropStart?: () => void;
    overlayColor: string;
    onOverlayColorChange: (color: string) => void;
}

const OVERLAY_COLORS = [
    { value: 'none', label: 'Original', color: 'bg-gray-200' },
    { value: 'red', label: 'Red', color: 'bg-red-500' },
    { value: 'green', label: 'Green', color: 'bg-green-500' },
    { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
];

const BLEND_MODES = [
    { value: 'normal', label: 'Normal' },
    { value: 'multiply', label: 'Multiply' },
    { value: 'screen', label: 'Screen' },
    { value: 'overlay', label: 'Overlay' },
    { value: 'difference', label: 'Difference' },
];

const NUDGE_AMOUNT = 1;
const SCALE_STEP = 0.01;
const ROTATION_STEP = 1;

export const OverlayControlPanel: React.FC<OverlayControlPanelProps> = ({
    isOpen,
    onClose,
    images,
    selectedOverlayId,
    onSelectOverlay,
    opacity,
    onOpacityChange,
    blendMode,
    onBlendModeChange,
    onUpload,
    onCopyCurrent,
    offset,
    onOffsetChange,
    scale,
    onScaleChange,
    rotation,
    onRotationChange,
    isInteractive,
    onToggleInteraction,
    onCropStart,
    overlayColor,
    onOverlayColorChange,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showAlignment, setShowAlignment] = useState(false);
    const [showBlendMode, setShowBlendMode] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="absolute top-24 right-20 z-30 w-80 bg-white/60 backdrop-blur-xl border border-white/40 
        shadow-xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="p-4 border-b border-gray-200/50 flex items-center justify-between bg-white/40">
                <div className="flex items-center gap-2 text-gray-800 font-semibold">
                    <Layers className="w-5 h-5 text-orange-500" />
                    <span>Overlay Comparison</span>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-black/5 rounded-full transition-colors text-gray-500"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="p-4 space-y-4">
                {/* Image Selector */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Compare With
                    </label>
                    <select
                        value={selectedOverlayId || ''}
                        onChange={(e) => onSelectOverlay(e.target.value)}
                        className="w-full text-sm bg-white/50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-shadow"
                    >
                        <option value="">Select a revision...</option>
                        {images.map((img) => (
                            <option key={img.id} value={img.id}>
                                {img.name}
                            </option>
                        ))}
                    </select>
                    <div className="flex justify-between mt-1">
                        {onUpload && (
                            <div className=" text-right">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            onUpload(file);
                                            // Reset input so same file can be selected again
                                            e.target.value = '';
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs flex bg-gray-100 py-1 px-2 rounded-xl 
                                    items-center gap-1 text-gray-600 hover:text-blue-700 font-medium"
                                >
                                    <Upload className="w-3 h-3" />
                                    Upload
                                </button>
                            </div>
                        )}

                        {onCopyCurrent && (
                            <div className=" flex justify-between gap-2">
                                {onCropStart && (
                                    <button
                                        onClick={onCropStart}
                                        className="text-xs flex items-center gap-1  text-gray-600 hover:text-blue-700 font-medium"
                                    >
                                        <Crop className="w-3 h-3" />
                                        Crop
                                    </button>
                                )}
                                <button
                                    onClick={onCopyCurrent}
                                    className="text-xs flex items-center gap-1 text-gray-600 hover:text-blue-700 font-medium"
                                >
                                    <Copy className="w-3 h-3" />
                                    Use Current Image
                                </button>
                            </div>
                        )}
                    </div>

                </div>

                {selectedOverlayId && (
                    <>
                        {/* Opacity Slider */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Opacity
                                </label>
                                <span className="text-xs font-medium text-gray-700">
                                    {Math.round(opacity * 100)}%
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={opacity}
                                onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                        </div>

                        {/* Color Overlay Selection */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Overlay Color
                            </label>
                            <div className="flex gap-2">
                                {OVERLAY_COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        onClick={() => onOverlayColorChange(color.value)}
                                        className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center
                                            ${overlayColor === color.value ? 'border-blue-500 scale-110 shadow-sm' : 'border-transparent hover:scale-105'}`}
                                        title={color.label}
                                    >
                                        <div className={`w-6 h-6 rounded-full ${color.color} ${color.value === 'none' ? 'border border-gray-300' : ''}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Blend Mode Selector */}
                        <div className="space-y-2 pt-2 border-t border-gray-200/50">
                            <button
                                onClick={() => setShowBlendMode(!showBlendMode)}
                                className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 mb-2"
                            >
                                <span>Blend Mode</span>
                                {showBlendMode ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                            </button>

                            {showBlendMode && (
                                <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                    {BLEND_MODES.map((mode) => (
                                        <button
                                            key={mode.value}
                                            onClick={() => onBlendModeChange(mode.value)}
                                            className={`
                                            text-xs px-3 py-2 rounded-lg font-medium transition-all
                                            ${blendMode === mode.value
                                                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                                                    : 'bg-white/50 text-gray-600 hover:bg-white hover:shadow-sm'
                                                }
                                            `}
                                        >
                                            {mode.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Alignment Section */}
                        <div className="pt-2 border-t border-gray-200/50">
                            <button
                                onClick={() => setShowAlignment(!showAlignment)}
                                className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 mb-2"
                            >
                                <span>Alignment</span>
                                <Move className="w-3 h-3" />
                            </button>

                            {/* Interactive Mode Toggle */}
                            <div className="mb-3 flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-100">
                                <span className="text-xs font-medium text-gray-800">Drag to Move</span>
                                <button
                                    onClick={onToggleInteraction}
                                    className={`p-1.5 rounded-md transition-all ${isInteractive
                                        ? 'bg-gray-500 text-white shadow-sm'
                                        : 'bg-white text-orange-500 hover:bg-orange-100'
                                        }`}
                                    title="Toggle Drag Mode"
                                >
                                    <Hand className="w-4 h-4" />
                                </button>
                            </div>

                            {showAlignment && (
                                <div className="space-y-3 p-2 bg-white/40 rounded-lg">
                                    {/* Position Nudge */}
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-gray-500 block mb-1">Position (X: {Math.round(offset.x)}, Y: {Math.round(offset.y)})</span>
                                        <div className="flex justify-center items-center gap-1">
                                            <button onClick={() => onOffsetChange({ ...offset, x: offset.x - NUDGE_AMOUNT })} className="p-1.5 bg-white shadow-sm rounded hover:bg-gray-50 active:bg-gray-100"><ArrowLeft className="w-3 h-3" /></button>
                                            <div className="flex flex-col gap-1">
                                                <button onClick={() => onOffsetChange({ ...offset, y: offset.y - NUDGE_AMOUNT })} className="p-1.5 bg-white shadow-sm rounded hover:bg-gray-50 active:bg-gray-100"><ArrowUp className="w-3 h-3" /></button>
                                                <button onClick={() => onOffsetChange({ ...offset, y: offset.y + NUDGE_AMOUNT })} className="p-1.5 bg-white shadow-sm rounded hover:bg-gray-50 active:bg-gray-100"><ArrowDown className="w-3 h-3" /></button>
                                            </div>
                                            <button onClick={() => onOffsetChange({ ...offset, x: offset.x + NUDGE_AMOUNT })} className="p-1.5 bg-white shadow-sm rounded hover:bg-gray-50 active:bg-gray-100"><ArrowRight className="w-3 h-3" /></button>
                                        </div>
                                    </div>

                                    {/* Scale */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-[10px] text-gray-500">Scale</span>
                                            <span className="text-[10px] text-gray-700">{scale.toFixed(2)}x</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => onScaleChange(scale - SCALE_STEP)} className="p-1 bg-white shadow-sm rounded hover:bg-gray-50"><Minus className="w-3 h-3" /></button>
                                            <input
                                                type="range"
                                                min="0.5"
                                                max="2"
                                                step="0.01"
                                                value={scale}
                                                onChange={(e) => onScaleChange(parseFloat(e.target.value))}
                                                className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                            />
                                            <button onClick={() => onScaleChange(scale + SCALE_STEP)} className="p-1 bg-white shadow-sm rounded hover:bg-gray-50"><Plus className="w-3 h-3" /></button>
                                        </div>
                                    </div>

                                    {/* Rotation */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-[10px] text-gray-500">Rotation</span>
                                            <button onClick={() => { onOffsetChange({ x: 0, y: 0 }); onScaleChange(1); onRotationChange(0); }} title="Reset All" className="text-[10px] text-red-500 flex items-center gap-0.5 hover:underline"><RefreshCcw className="w-3 h-3" /> Reset</button>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <button onClick={() => onRotationChange(rotation - ROTATION_STEP)} className="p-1 bg-white shadow-sm rounded hover:bg-gray-50 flex-1 flex justify-center"><RotateCw className="w-3 h-3 -scale-x-100" /></button>
                                            <span className="text-[10px] min-w-[3ch] text-center">{Math.round(rotation)}°</span>
                                            <button onClick={() => onRotationChange(rotation + ROTATION_STEP)} className="p-1 bg-white shadow-sm rounded hover:bg-gray-50 flex-1 flex justify-center"><RotateCw className="w-3 h-3" /></button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
