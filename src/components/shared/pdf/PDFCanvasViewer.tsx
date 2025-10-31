"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  PDFPageData,
  AnnotationTool,
  DrawingPath,
  Point,
  ShapeAnnotation,
  TextAnnotation,
} from "@/@types/pdf/pdfAnnotation.interface";

interface PDFCanvasViewerProps {
  page: PDFPageData;
  zoom: number;
  selectedTool: AnnotationTool;
  toolColor: string;
  toolWidth: number;
  toolOpacity: number;
  fontSize: number;
  isDrawing: boolean;
  onDrawingStart: () => void;
  onDrawingEnd: () => void;
  onAddDrawing: (drawing: DrawingPath) => void;
  onAddShape: (shape: ShapeAnnotation) => void;
  onAddText: (text: TextAnnotation) => void;
  onUpdateText: (textId: string, updates: Partial<TextAnnotation>) => void;
  onAnnotationSelect: (annotationId: string | null) => void;
}

const PDFCanvasViewer: React.FC<PDFCanvasViewerProps> = ({
  page,
  zoom,
  selectedTool,
  toolColor,
  toolWidth,
  toolOpacity,
  fontSize,
  isDrawing,
  onDrawingStart,
  onDrawingEnd,
  onAddDrawing,
  onAddShape,
  onAddText,
  onUpdateText,
  onAnnotationSelect,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isCurrentlyDrawing, setIsCurrentlyDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [textPosition, setTextPosition] = useState<Point | null>(null);
  const [textInput, setTextInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [cursorStyle, setCursorStyle] = useState<string>("crosshair");

  // Draw all annotations on the canvas
  const drawAnnotations = useCallback(
    (ctx: CanvasRenderingContext2D, scale: number) => {
      // Draw paths
      page.annotations.drawings.forEach((drawing) => {
        ctx.save();
        ctx.strokeStyle = drawing.color;
        ctx.lineWidth = drawing.width * scale;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalAlpha = drawing.opacity || 1;

        if (drawing.tool === "highlighter") {
          ctx.globalAlpha = 0.3;
        }

        if (drawing.points.length > 0) {
          ctx.beginPath();
          ctx.moveTo(drawing.points[0].x * scale, drawing.points[0].y * scale);

          for (let i = 1; i < drawing.points.length; i++) {
            ctx.lineTo(drawing.points[i].x * scale, drawing.points[i].y * scale);
          }

          ctx.stroke();
        }

        ctx.restore();
      });

      // Draw shapes
      page.annotations.shapes.forEach((shape) => {
        ctx.save();
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.width * scale;
        ctx.globalAlpha = 1;

        const startX = shape.startPoint.x * scale;
        const startY = shape.startPoint.y * scale;
        const endX = shape.endPoint.x * scale;
        const endY = shape.endPoint.y * scale;

        ctx.beginPath();

        switch (shape.type) {
          case "rectangle":
            ctx.rect(startX, startY, endX - startX, endY - startY);
            if (shape.fill && shape.fillColor) {
              ctx.fillStyle = shape.fillColor;
              ctx.globalAlpha = 0.3;
              ctx.fill();
              ctx.globalAlpha = 1;
            }
            break;

          case "circle":
            const radiusX = Math.abs(endX - startX) / 2;
            const radiusY = Math.abs(endY - startY) / 2;
            const centerX = (startX + endX) / 2;
            const centerY = (startY + endY) / 2;
            ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
            if (shape.fill && shape.fillColor) {
              ctx.fillStyle = shape.fillColor;
              ctx.globalAlpha = 0.3;
              ctx.fill();
              ctx.globalAlpha = 1;
            }
            break;

          case "line":
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            break;

          case "arrow":
            // Draw line
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);

            // Draw arrowhead
            const angle = Math.atan2(endY - startY, endX - startX);
            const arrowLength = 15 * scale;
            const arrowAngle = Math.PI / 6;

            ctx.moveTo(endX, endY);
            ctx.lineTo(
              endX - arrowLength * Math.cos(angle - arrowAngle),
              endY - arrowLength * Math.sin(angle - arrowAngle)
            );
            ctx.moveTo(endX, endY);
            ctx.lineTo(
              endX - arrowLength * Math.cos(angle + arrowAngle),
              endY - arrowLength * Math.sin(angle + arrowAngle)
            );
            break;
        }

        ctx.stroke();
        ctx.restore();
      });

      // Draw text annotations
      page.annotations.texts.forEach((text) => {
        ctx.save();
        ctx.fillStyle = text.color;
        ctx.font = `${text.fontSize * scale}px ${text.fontFamily || "Arial"}`;
        ctx.fillText(text.text, text.position.x * scale, text.position.y * scale);
        ctx.restore();
      });
    },
    [page.annotations]
  );

  // Load and render the PDF page
  useEffect(() => {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx || !overlayCanvas) return;

    const img = new Image();
    img.onload = () => {
      // Use the actual image dimensions for high quality
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;

      console.log("Image natural dimensions:", imgWidth, "x", imgHeight);
      console.log("Page dimensions:", page.width, "x", page.height);
      console.log("Zoom:", zoom);

      // Set canvas internal resolution to match image resolution for quality
      canvas.width = imgWidth;
      canvas.height = imgHeight;
      
      // Calculate display size to fit container while maintaining aspect ratio
      const container = containerRef.current;
      if (!container) return;
      
      const containerWidth = container.clientWidth - 32; // Account for padding
      const containerHeight = container.clientHeight - 32;
      
      // Calculate scale to fit container
      const scaleX = containerWidth / imgWidth;
      const scaleY = containerHeight / imgHeight;
      const fitScale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%
      
      // Apply zoom on top of fit scale
      const finalScale = fitScale * zoom;
      
      const displayWidth = imgWidth * finalScale;
      const displayHeight = imgHeight * finalScale;
      
      console.log("Display dimensions:", displayWidth, "x", displayHeight);
      console.log("Fit scale:", fitScale, "Final scale:", finalScale);
      
      // Set canvas display size
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;

      // Draw image at full resolution
      ctx.save();
      ctx.translate(imgWidth / 2, imgHeight / 2);
      ctx.rotate((page.rotation * Math.PI) / 180);
      ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
      ctx.restore();

      // Draw existing annotations (scale them to match image resolution)
      const annotationScale = imgWidth / page.width;
      drawAnnotations(ctx, annotationScale);

      // Update overlay canvas to match display size
      overlayCanvas.width = imgWidth;
      overlayCanvas.height = imgHeight;
      overlayCanvas.style.width = `${displayWidth}px`;
      overlayCanvas.style.height = `${displayHeight}px`;
    };

    img.src = page.dataUrl;
  }, [page, zoom, drawAnnotations]);

  // Redraw overlay canvas during drawing
  useEffect(() => {
    const overlay = overlayCanvasRef.current;
    const mainCanvas = canvasRef.current;
    const ctx = overlay?.getContext("2d");

    if (!overlay || !ctx || !mainCanvas) return;

    ctx.clearRect(0, 0, overlay.width, overlay.height);

    // Calculate the scale factor for drawing (canvas resolution / display size)
    const drawingScale = mainCanvas.width / mainCanvas.offsetWidth;

    if (isCurrentlyDrawing && currentPath.length > 0) {
      ctx.save();
      
      if (selectedTool === "eraser") {
        // Show eraser cursor path
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = toolWidth * drawingScale * 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalAlpha = 0.3;
        ctx.setLineDash([5, 5]);
      } else {
        ctx.strokeStyle = toolColor;
        ctx.lineWidth = toolWidth * drawingScale;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalAlpha = selectedTool === "highlighter" ? 0.3 : toolOpacity;
      }

      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);

      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y);
      }

      ctx.stroke();
      ctx.restore();
    }

    // Draw preview shape
    if (isCurrentlyDrawing && startPoint && currentPath.length > 0) {
      const endPoint = currentPath[currentPath.length - 1];

      ctx.save();
      ctx.strokeStyle = toolColor;
      ctx.lineWidth = toolWidth * drawingScale;
      ctx.globalAlpha = toolOpacity;
      ctx.beginPath();

      switch (selectedTool) {
        case "rectangle":
          ctx.rect(
            startPoint.x,
            startPoint.y,
            endPoint.x - startPoint.x,
            endPoint.y - startPoint.y
          );
          break;

        case "circle":
          const radiusX = Math.abs(endPoint.x - startPoint.x) / 2;
          const radiusY = Math.abs(endPoint.y - startPoint.y) / 2;
          const centerX = (startPoint.x + endPoint.x) / 2;
          const centerY = (startPoint.y + endPoint.y) / 2;
          ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
          break;

        case "line":
          ctx.moveTo(startPoint.x, startPoint.y);
          ctx.lineTo(endPoint.x, endPoint.y);
          break;

        case "arrow":
          ctx.moveTo(startPoint.x, startPoint.y);
          ctx.lineTo(endPoint.x, endPoint.y);

          const angle = Math.atan2(
            endPoint.y - startPoint.y,
            endPoint.x - startPoint.x
          );
          const arrowLength = 15 * drawingScale;
          const arrowAngle = Math.PI / 6;

          ctx.moveTo(endPoint.x, endPoint.y);
          ctx.lineTo(
            endPoint.x - arrowLength * Math.cos(angle - arrowAngle),
            endPoint.y - arrowLength * Math.sin(angle - arrowAngle)
          );
          ctx.moveTo(endPoint.x, endPoint.y);
          ctx.lineTo(
            endPoint.x - arrowLength * Math.cos(angle + arrowAngle),
            endPoint.y - arrowLength * Math.sin(angle + arrowAngle)
          );
          break;
      }

      ctx.stroke();
      ctx.restore();
    }
  }, [
    isCurrentlyDrawing,
    currentPath,
    startPoint,
    toolColor,
    toolWidth,
    toolOpacity,
    zoom,
    selectedTool,
  ]);

  // Update cursor style based on tool selection
  useEffect(() => {
    if (isDraggingText) {
      setCursorStyle("grabbing");
    } else if (selectedTool === "select") {
      setCursorStyle("default");
    } else if (selectedTool === "text") {
      setCursorStyle("text");
    } else {
      setCursorStyle("crosshair");
    }
  }, [selectedTool, isDraggingText]);

  const getMousePosition = (e: React.MouseEvent): Point => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    // Calculate scale factor between displayed size and actual canvas size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Get the scale factor for converting between canvas and page coordinates
  const getCanvasToPageScale = (): number => {
    const canvas = canvasRef.current;
    if (!canvas) return 1;
    return canvas.width / page.width;
  };

  // Check if mouse is over a text annotation
  const getTextAtPosition = (point: Point): TextAnnotation | null => {
    const scale = getCanvasToPageScale();
    const normalizedPoint = {
      x: point.x / scale,
      y: point.y / scale,
    };

    return page.annotations.texts.find(text => {
      const textWidth = text.text.length * text.fontSize * 0.6;
      const textHeight = text.fontSize * 1.2;
      
      return (
        normalizedPoint.x >= text.position.x &&
        normalizedPoint.x <= text.position.x + textWidth &&
        normalizedPoint.y >= text.position.y - textHeight &&
        normalizedPoint.y <= text.position.y
      );
    }) || null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const point = getMousePosition(e);

    // Check if clicking on existing text (for dragging)
    if (selectedTool === "select") {
      const clickedText = getTextAtPosition(point);
      if (clickedText) {
        const scale = getCanvasToPageScale();
        setSelectedTextId(clickedText.id);
        setIsDraggingText(true);
        setDragOffset({
          x: point.x - clickedText.position.x * scale,
          y: point.y - clickedText.position.y * scale,
        });
        onAnnotationSelect(clickedText.id);
        return;
      }
      return;
    }

    if (selectedTool === "text") {
      // Use screen coordinates for text input modal
      setTextPosition({
        x: e.clientX,
        y: e.clientY
      });
      setShowTextInput(true);
      return;
    }

    setIsCurrentlyDrawing(true);
    onDrawingStart();

    if (
      selectedTool === "pen" ||
      selectedTool === "highlighter" ||
      selectedTool === "eraser"
    ) {
      setCurrentPath([point]);
    } else {
      setStartPoint(point);
      setCurrentPath([point]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const point = getMousePosition(e);

    // Handle text dragging
    if (isDraggingText && selectedTextId) {
      setCursorStyle("grabbing");
      return;
    }

    // Check if hovering over text in select mode
    if (selectedTool === "select" && !isCurrentlyDrawing) {
      const hoveredText = getTextAtPosition(point);
      setCursorStyle(hoveredText ? "grab" : "default");
    }

    if (!isCurrentlyDrawing) return;

    setCurrentPath((prev) => [...prev, point]);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    // Handle text drag completion
    if (isDraggingText && selectedTextId) {
      const point = getMousePosition(e);
      const scale = getCanvasToPageScale();
      const newPosition = {
        x: (point.x - dragOffset.x) / scale,
        y: (point.y - dragOffset.y) / scale,
      };
      
      // Update text position using the callback
      onUpdateText(selectedTextId, { position: newPosition });
      
      setIsDraggingText(false);
      setSelectedTextId(null);
      setDragOffset({ x: 0, y: 0 });
      return;
    }

    if (!isCurrentlyDrawing) return;

    setIsCurrentlyDrawing(false);
    onDrawingEnd();

    if (currentPath.length === 0) return;

    // Convert canvas coordinates to page coordinates
    const scale = getCanvasToPageScale();
    const normalizedPath = currentPath.map((p) => ({
      x: p.x / scale,
      y: p.y / scale,
    }));

    if (
      selectedTool === "pen" ||
      selectedTool === "highlighter" ||
      selectedTool === "eraser"
    ) {
      const drawing: DrawingPath = {
        id: `drawing_${Date.now()}_${Math.random()}`,
        tool: selectedTool,
        points: normalizedPath,
        color: toolColor,
        width: toolWidth,
        opacity: selectedTool === "highlighter" ? 0.3 : toolOpacity,
      };
      onAddDrawing(drawing);
    } else if (
      selectedTool === "rectangle" ||
      selectedTool === "circle" ||
      selectedTool === "line" ||
      selectedTool === "arrow"
    ) {
      if (startPoint) {
        const scale = getCanvasToPageScale();
        const normalizedStart = { x: startPoint.x / scale, y: startPoint.y / scale };
        const normalizedEnd = {
          x: currentPath[currentPath.length - 1].x / scale,
          y: currentPath[currentPath.length - 1].y / scale,
        };

        const shape: ShapeAnnotation = {
          id: `shape_${Date.now()}_${Math.random()}`,
          type: selectedTool,
          startPoint: normalizedStart,
          endPoint: normalizedEnd,
          color: toolColor,
          width: toolWidth,
        };
        onAddShape(shape);
      }
    }

    setCurrentPath([]);
    setStartPoint(null);
  };

  const handleTextSubmit = () => {
    if (textInput && textPosition) {
      // Get canvas position from screen coordinates
      const canvas = overlayCanvasRef.current;
      if (!canvas) {
        console.error("Canvas ref not available");
        return;
      }
      
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const canvasX = (textPosition.x - rect.left) * scaleX;
      const canvasY = (textPosition.y - rect.top) * scaleY;
      
      const pageScale = getCanvasToPageScale();
      const normalizedPosition = {
        x: canvasX / pageScale,
        y: canvasY / pageScale,
      };

      const textAnnotation: TextAnnotation = {
        id: `text_${Date.now()}_${Math.random()}`,
        text: textInput,
        position: normalizedPosition,
        fontSize: fontSize,
        color: toolColor,
      };

      console.log("Adding text annotation:", textAnnotation);
      onAddText(textAnnotation);
      setTextInput("");
      setShowTextInput(false);
      setTextPosition(null);
    }
  };

  const handleTextCancel = () => {
    setTextInput("");
    setShowTextInput(false);
    setTextPosition(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto bg-gray-100 w-full h-full"
    >
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative inline-block">
          <canvas
            ref={canvasRef}
            className="border border-gray-300 bg-white shadow-lg block"
          />
          <canvas
            ref={overlayCanvasRef}
            className="absolute top-0 left-0 pointer-events-auto"
            style={{ cursor: cursorStyle }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />

          {/* <img src={page.dataUrl} alt={`PDF Page ${page.pageNumber}`}/> */}

          {/* Text Input Overlay */}
          {showTextInput && textPosition && (
            <div
              className="fixed bg-white border-2 border-blue-500 rounded shadow-lg p-2"
              style={{
                left: `${textPosition.x}px`,
                top: `${textPosition.y}px`,
                zIndex: 1000,
                transform: 'translate(0, 0)'
              }}
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTextSubmit();
                  if (e.key === "Escape") handleTextCancel();
                }}
                className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                placeholder="Enter text..."
                autoFocus
                style={{ fontSize: `${fontSize}px`, minWidth: '200px' }}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleTextSubmit}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  Add
                </button>
                <button
                  onClick={handleTextCancel}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFCanvasViewer;
