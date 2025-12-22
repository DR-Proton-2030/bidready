'use client'
import React, { useRef, useState, useEffect } from 'react';

interface OverlayLayerProps {
    imageSrc: string;
    opacity: number;
    blendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';
    transformStyle: React.CSSProperties;
    offset?: { x: number; y: number };
    scale?: number;
    rotation?: number;
    isInteractive?: boolean;
    onOffsetChange?: (offset: { x: number; y: number }) => void;
    zoom?: number;
    crop?: { x: number; y: number; width: number; height: number };
    color?: string;
}

// Preset hue-rotate values for common colors (more accurate than calculating)
const PRESET_HUE_ROTATIONS: Record<string, number> = {
    red: 0,
    green: 90,
    blue: 200,
    cyan: 155,
    magenta: 270,
    yellow: 35,
    orange: 20,
    purple: 240,
    pink: 300,
};

// Convert hex color to HSL and return hue in degrees
const hexToHue = (hex: string): number => {
    const cleanHex = hex.replace('#', '');
    let r, g, b;
    
    if (cleanHex.length === 3) {
        r = parseInt(cleanHex[0] + cleanHex[0], 16) / 255;
        g = parseInt(cleanHex[1] + cleanHex[1], 16) / 255;
        b = parseInt(cleanHex[2] + cleanHex[2], 16) / 255;
    } else {
        r = parseInt(cleanHex.substring(0, 2), 16) / 255;
        g = parseInt(cleanHex.substring(2, 4), 16) / 255;
        b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    }

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;

    if (max !== min) {
        const d = max - min;
        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }

    return h * 360;
};

// Generate a unique filter ID for custom colors
const getFilterId = (color: string): string => {
    return `colorize-${color.replace('#', '')}`;
};

export const OverlayLayer: React.FC<OverlayLayerProps> = ({
    imageSrc,
    opacity,
    blendMode,
    transformStyle,
    offset = { x: 0, y: 0 },
    scale = 1,
    rotation = 0,
    isInteractive = false,
    onOffsetChange,
    zoom = 1,
    crop,
    color = 'none',
}) => {
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const offsetStart = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!isInteractive || !onOffsetChange) return;

        e.preventDefault();
        e.stopPropagation();

        isDragging.current = true;
        dragStart.current = { x: e.clientX, y: e.clientY };
        offsetStart.current = { ...offset };

        // Disable text selection/etc while dragging
        document.body.style.userSelect = 'none';
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging.current || !onOffsetChange) return;

            const deltaX = (e.clientX - dragStart.current.x) / zoom;
            const deltaY = (e.clientY - dragStart.current.y) / zoom;

            // Calculate new position respecting rotation if needed? 
            // For simple translation, just adding delta is intuitive enough, 
            // but rotation affects axes. Let's keep it simple (screen space translation) for now.
            // If rotation is 90deg, moving mouse right moves image down. 
            // Actually, since the transform order is translate -> scale -> rotate,
            // we are adjusting the translation value directly. 
            // However, the visual result depends on rotation.
            // To make "mouse moves right -> image moves right on screen", 
            // we need to counter-rotate the delta vector.

            const rad = -(rotation * Math.PI) / 180;
            const rotDeltaX = deltaX * Math.cos(rad) - deltaY * Math.sin(rad);
            const rotDeltaY = deltaX * Math.sin(rad) + deltaY * Math.cos(rad);

            onOffsetChange({
                x: offsetStart.current.x + rotDeltaX,
                y: offsetStart.current.y + rotDeltaY
            });
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            document.body.style.userSelect = '';
        };

        if (isInteractive) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isInteractive, onOffsetChange, zoom, rotation]);

    if (!imageSrc) return null;

    const cropStyle: React.CSSProperties = crop ? {
        width: `${crop.width}px`,
        height: `${crop.height}px`,
        objectFit: 'none',
        objectPosition: `-${crop.x}px -${crop.y}px`,
    } : {
        width: '100%',
        height: '100%',
    };

    // Combine the main image zoom with the overlay's own scale adjustment
    const combinedScale = zoom * scale;

    // Determine if we need SVG filter for custom color
    const isCustomHex = color && color.startsWith('#') && (color.length === 7 || color.length === 4);
    const isPresetColor = color && PRESET_HUE_ROTATIONS[color] !== undefined;
    const filterId = isCustomHex ? getFilterId(color) : null;

    // Parse hex to RGB for SVG filter
    const hexToRgb = (hex: string) => {
        const cleanHex = hex.replace('#', '');
        let r, g, b;
        if (cleanHex.length === 3) {
            r = parseInt(cleanHex[0] + cleanHex[0], 16);
            g = parseInt(cleanHex[1] + cleanHex[1], 16);
            b = parseInt(cleanHex[2] + cleanHex[2], 16);
        } else {
            r = parseInt(cleanHex.substring(0, 2), 16);
            g = parseInt(cleanHex.substring(2, 4), 16);
            b = parseInt(cleanHex.substring(4, 6), 16);
        }
        return { r: r / 255, g: g / 255, b: b / 255 };
    };

    const rgb = isCustomHex ? hexToRgb(color) : null;

    // Build filter style
    let filterStyle = 'none';
    if (color === 'none' || !color) {
        filterStyle = 'none';
    } else if (isPresetColor) {
        // Use hue-rotate for preset colors
        const hue = PRESET_HUE_ROTATIONS[color];
        filterStyle = `grayscale(100%) sepia(100%) saturate(400%) hue-rotate(${hue}deg)`;
    } else if (isCustomHex && filterId) {
        filterStyle = `url(#${filterId})`;
    }

    return (
        <div
            className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden"
            style={{
                zIndex: 10,
                mixBlendMode: blendMode as any // Apply blend mode to container to avoid conflict with filter
            }}
        >
            {/* SVG Filter Definition for Custom Colors */}
            {isCustomHex && rgb && filterId && (
                <svg width="0" height="0" style={{ position: 'absolute' }}>
                    <defs>
                        <filter id={filterId} colorInterpolationFilters="sRGB">
                            {/* Convert to grayscale first */}
                            <feColorMatrix
                                type="matrix"
                                values="0.33 0.33 0.33 0 0
                                        0.33 0.33 0.33 0 0
                                        0.33 0.33 0.33 0 0
                                        0    0    0    1 0"
                            />
                            {/* Then colorize with the target color */}
                            <feColorMatrix
                                type="matrix"
                                values={`${rgb.r} 0 0 0 0
                                         0 ${rgb.g} 0 0 0
                                         0 0 ${rgb.b} 0 0
                                         0 0 0 1 0`}
                            />
                        </filter>
                    </defs>
                </svg>
            )}
            <img
                src={imageSrc}
                alt="Overlay Layer"
                className={crop ? "max-w-none max-h-none" : "max-w-full max-h-full object-contain"}
                style={{
                    ...cropStyle,
                    opacity: opacity,
                    // mixBlendMode moved to parent
                    // Use combinedScale (zoom * scale) so overlay zooms with main image
                    transform: `translate(${(crop?.x || 0) + offset.x}px, ${(crop?.y || 0) + offset.y}px) scale(${combinedScale}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                    filter: filterStyle,
                    pointerEvents: isInteractive ? 'auto' : 'none',
                    cursor: isInteractive ? 'move' : 'default'
                }}
                draggable={false}
                onMouseDown={handleMouseDown}
            />
        </div>
    );
};
