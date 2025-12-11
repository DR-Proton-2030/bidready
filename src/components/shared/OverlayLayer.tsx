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
}

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

    return (
        <div
            className={`absolute inset-0 z-10 overflow-visible ${isInteractive ? 'pointer-events-auto cursor-move' : 'pointer-events-none'}`}
            style={transformStyle}
            onMouseDown={handleMouseDown}
        >
            <img
                src={imageSrc}
                alt="Overlay Layer"
                className="max-w-full max-h-full object-contain"
                style={{
                    width: '100%',
                    height: '100%',
                    opacity: opacity,
                    mixBlendMode: blendMode,
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                }}
                draggable={false}
            />
        </div>
    );
};
