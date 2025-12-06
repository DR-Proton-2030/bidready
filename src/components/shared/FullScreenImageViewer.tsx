"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Clock3,
} from "lucide-react";
import RightToolbar from "./RightToolbar";
import CompanyLogo from "./companyLogo/CompanyLogo";
import AskAISidePanel from "./AskAISidePanel";
import { FullScreenImageHeader } from "./FullScreenImageHeader";

interface Image {
  id: string;
  name: string;
  path: string;
  pageNumber?: number;
}

interface Detection {
  x: number;
  y: number;
  width: number;
  height: number;
  class?: string;
  confidence?: number;
  color: string;
  id: string;
  // optional polygon points (in image pixel coords)
  points?: Array<{ x: number; y: number }>;
  meta?: Record<string, any>;
}

type MeasurementPoint = { x: number; y: number };

interface MeasurementOverlay {
  id: string;
  start: MeasurementPoint;
  end: MeasurementPoint;
  lengthPx: number;
  value: number;
  unit: string;
  label: string;
  hasCalibration: boolean;
}

type NormalizedDetectionSummary = {
  id: string | null;
  label: string;
  confidence: number | null;
  source: string;
  center: { x: number; y: number };
  size: { width: number; height: number };
  polygon: Array<{ x: number; y: number }> | null;
  pageNumber: number | null;
};

type NormalizedAnnotationSummary = {
  id: string;
  label: string;
  confidence: number | null;
  center: { x: number; y: number };
  size: { width: number; height: number };
  polygon: Array<{ x: number; y: number }> | null;
  meta: Record<string, any> | null;
};

type MeasurementSummary = {
  id: string;
  start: MeasurementPoint;
  end: MeasurementPoint;
  lengthPx: number;
  value: number;
  unit: string;
  label: string;
  calibrated: boolean;
};

type ClassStat = {
  count: number;
  avgConfidence: number | null;
  confidences: number[];
};

interface FullScreenImageViewerProps {
  images: Image[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onImageChange?: (image: Image, index: number) => void;
  detectionResults?: any;
  onSvgOverlayUpdate?: (imageId: string, svgData: string | null) => void;
  onDetectionsChange?: (imageId: string, combinedDetections: Array<any>) => void;
}

const areaFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

const lengthFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

const measurementColor = "#38bdf8";
const measurementDraftColor = "#60a5fa";

export default function FullScreenImageViewer({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  onImageChange,
  detectionResults,
  onSvgOverlayUpdate,
  onDetectionsChange,
}: FullScreenImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  // console.log("=========>detectionResults", detectionResults);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [displayDimensions, setDisplayDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [showDetections, setShowDetections] = useState(true);
  const [showElectrical, setShowElectrical] = useState(false);
  const [showDimensions, setShowDimensions] = useState(false);
  const [hoveredShapeId, setHoveredShapeId] = useState<string | null>(null);
  const [shapeTooltip, setShapeTooltip] = useState<
    | {
      x: number;
      y: number;
      name: string;
      area?: string;
      color: string;
    }
    | null
  >(null);
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(
    new Set()
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leftToolbarOpen, setLeftToolbarOpen] = useState(true);
  const [activeTool, setActiveTool] = useState("select");
  const [showGrid, setShowGrid] = useState(false);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<MeasurementOverlay[]>([]);
  const [measurementDraft, setMeasurementDraft] = useState<{
    id: string;
    start: MeasurementPoint;
    end: MeasurementPoint;
  } | null>(null);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [askAiOpen, setAskAiOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [customClasses, setCustomClasses] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [currentBox, setCurrentBox] = useState<any>(null);
  const [userAnnotations, setUserAnnotations] = useState<Detection[]>([]);
  const [polygonPoints, setPolygonPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [draggingPointIndex, setDraggingPointIndex] = useState<number | null>(null);
  const [editingAnnotationId, setEditingAnnotationId] = useState<string | null>(null);
  const [showClassSelector, setShowClassSelector] = useState(false);
  const [pendingAnnotation, setPendingAnnotation] = useState<any>(null);
  const [selectedAnnotationClass, setSelectedAnnotationClass] = useState("");
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [dismissedDetections, setDismissedDetections] = useState<Set<string>>(new Set());
  type UndoAction = { kind: "user" | "api"; id: string; payload?: Detection };
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string }>({ visible: false, message: "" });
  const snackbarTimerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const calibrationInfo = useMemo(() => {
    const cal = detectionResults?.dimension_calibration;
    if (!cal || typeof cal !== "object") return null;
    if (typeof cal.error === "string" && cal.error.length > 0) return null;

    const unit =
      (typeof cal.unit === "string" && cal.unit) ||
      (typeof cal.units === "string" && cal.units) ||
      (typeof cal.unit_name === "string" && cal.unit_name) ||
      (typeof cal.measurement_unit === "string" && cal.measurement_unit) ||
      (typeof cal.display_unit === "string" && cal.display_unit) ||
      "units";

    const numeric = (value: unknown) =>
      typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;

    let pixelsPerUnit =
      numeric((cal as any).pixels_per_unit) ??
      numeric((cal as any).px_per_unit) ??
      numeric((cal as any).pixel_per_unit) ??
      numeric((cal as any).pixelsPerUnit) ??
      numeric((cal as any).pixelPerUnit) ??
      null;

    let unitsPerPixel =
      numeric((cal as any).unit_per_pixel) ??
      numeric((cal as any).units_per_pixel) ??
      numeric((cal as any).unitPerPixel) ??
      numeric((cal as any).unitsPerPixel) ??
      null;

    if (!unitsPerPixel && pixelsPerUnit) {
      unitsPerPixel = 1 / pixelsPerUnit;
    }

    if (!unitsPerPixel && cal.reference && typeof cal.reference === "object") {
      const ref: any = cal.reference;
      const pixelDistance =
        numeric(ref.pixels) ??
        numeric(ref.pixel_distance) ??
        numeric(ref.pixelLength) ??
        numeric(ref.pixel_value) ??
        null;
      const realDistance =
        numeric(ref.real) ??
        numeric(ref.units) ??
        numeric(ref.real_distance) ??
        numeric(ref.realLength) ??
        numeric(ref.value) ??
        null;
      if (pixelDistance && realDistance) {
        unitsPerPixel = realDistance / pixelDistance;
      }
    }

    if (!unitsPerPixel && Array.isArray((cal as any).references)) {
      const refCandidate = (cal as any).references.find((entry: any) => {
        const pixelDistance = numeric(entry?.pixels);
        const realDistance = numeric(entry?.real);
        return pixelDistance && realDistance;
      });
      if (refCandidate) {
        unitsPerPixel =
          numeric(refCandidate.real) && numeric(refCandidate.pixels)
            ? (refCandidate.real as number) / (refCandidate.pixels as number)
            : null;
      }
    }

    if (!unitsPerPixel && numeric((cal as any).scale)) {
      const scaleValue = numeric((cal as any).scale);
      if (scaleValue) {
        // Assume scale denotes real-world units per pixel when value < 10, otherwise treat as pixels per unit
        unitsPerPixel = scaleValue <= 10 ? scaleValue : 1 / scaleValue;
      }
    }

    if (!unitsPerPixel || !Number.isFinite(unitsPerPixel) || unitsPerPixel <= 0) {
      return null;
    }

    return {
      unit,
      unitsPerPixel,
      pixelsPerUnit: 1 / unitsPerPixel,
    } as const;
  }, [detectionResults?.dimension_calibration]);

  const convertPixelDistance = useCallback(
    (pixels: number) => {
      const absolutePixels = Math.abs(pixels);
      if (!calibrationInfo) {
        const formatted = `${lengthFormatter.format(absolutePixels)} px`;
        return {
          value: absolutePixels,
          unit: "px",
          formatted,
          hasCalibration: false,
        } as const;
      }

      const value = absolutePixels * calibrationInfo.unitsPerPixel;
      const formatted = `${lengthFormatter.format(value)} ${calibrationInfo.unit}`;
      return {
        value,
        unit: calibrationInfo.unit,
        formatted,
        hasCalibration: true,
      } as const;
    },
    [calibrationInfo]
  );

  const convertPixelArea = useCallback(
    (pixelArea: number) => {
      const absoluteArea = Math.abs(pixelArea);
      if (!calibrationInfo) {
        const formatted = `${areaFormatter.format(absoluteArea)} px²`;
        return {
          value: absoluteArea,
          unit: "px²",
          formatted,
          hasCalibration: false,
        } as const;
      }

      const value =
        absoluteArea * calibrationInfo.unitsPerPixel * calibrationInfo.unitsPerPixel;
      const unit = `${calibrationInfo.unit}²`;
      const formatted = `${areaFormatter.format(value)} ${unit}`;
      return {
        value,
        unit,
        formatted,
        hasCalibration: true,
      } as const;
    },
    [calibrationInfo]
  );

  const computePolygonArea = useCallback((points: MeasurementPoint[]) => {
    if (!points || points.length < 3) return 0;
    let sum = 0;
    for (let i = 0; i < points.length; i += 1) {
      const current = points[i];
      const next = points[(i + 1) % points.length];
      sum += current.x * next.y - next.x * current.y;
    }
    return Math.abs(sum) / 2;
  }, []);

  const computePolygonCentroid = useCallback((points: MeasurementPoint[]) => {
    if (!points || points.length === 0) return { x: 0, y: 0 };
    let signedArea = 0;
    let cx = 0;
    let cy = 0;
    for (let i = 0; i < points.length; i += 1) {
      const current = points[i];
      const next = points[(i + 1) % points.length];
      const cross = current.x * next.y - next.x * current.y;
      signedArea += cross;
      cx += (current.x + next.x) * cross;
      cy += (current.y + next.y) * cross;
    }
    signedArea *= 0.5;
    if (Math.abs(signedArea) < 1e-6) {
      return points[0];
    }
    const factor = 1 / (6 * signedArea);
    return {
      x: cx * factor,
      y: cy * factor,
    };
  }, []);

  const detectionTimestamp = useMemo(() => {
    if (!detectionResults) return null;
    const rawTimestamp =
      (detectionResults as Record<string, any>).processedAt ??
      (detectionResults as Record<string, any>).processed_at ??
      (detectionResults as Record<string, any>).generatedAt ??
      (detectionResults as Record<string, any>).generated_at ??
      (detectionResults as Record<string, any>).createdAt ??
      (detectionResults as Record<string, any>).created_at ??
      (detectionResults as Record<string, any>).timestamp ??
      null;

    if (!rawTimestamp) return null;

    const timestamp = new Date(rawTimestamp);
    if (Number.isNaN(timestamp.getTime())) return null;

    const timeFormatter = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });

    const dateFormatter = new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    });

    return {
      iso: timestamp.toISOString(),
      timeLabel: timeFormatter.format(timestamp),
      dateLabel: dateFormatter.format(timestamp),
    } as const;
  }, [detectionResults]);

  const showUndoSnackbar = (message = "Removed. Undo?") => {
    setSnackbar({ visible: true, message });
    if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current);
    snackbarTimerRef.current = setTimeout(() => setSnackbar({ visible: false, message: "" }), 5000);
  };

  const undoLast = () => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const next = [...prev];
      const last = next.pop()!;
      if (last.kind === "user" && last.payload) {
        setUserAnnotations((anns) => [...anns, last.payload as Detection]);
      } else if (last.kind === "api") {
        setDismissedDetections((d) => {
          const nd = new Set(d);
          nd.delete(last.id);
          return nd;
        });
      }
      return next;
    });
    setSnackbar({ visible: false, message: "" });
  };

  const removeOverlayWithUndo = (id: string, isUser: boolean) => {
    if (isUser) {
      setUserAnnotations((prev) => {
        const found = prev.find((a) => a.id === id);
        if (found) {
          setUndoStack((stack) => [...stack, { kind: "user", id, payload: found }]);
        }
        return prev.filter((a) => a.id !== id);
      });
    } else {
      setDismissedDetections((prev) => new Set([...prev, id]));
      setUndoStack((stack) => [...stack, { kind: "api", id }]);
    }
    setSelectedOverlayId(null);
    showUndoSnackbar("Deleted. Undo?");
  };

  const currentImage = images[currentIndex];

  // Predefined colors for consistent class mapping
  const classColors = [
    "#000000ff", // Red
    "#3ed1c8ff", // Teal
    "#45b7d1ff", // Blue
    "#59dc9fff", // Green
    "#f7c627ff", // Yellow
    "#d85fd8ff", // Magenta
    "#66d8bbff", // Light Teal
    "#f6d450ff", // Gold
    "#a953ceff", // Purple
    "#f342e7ff", // Sky Blue
    "#ff8a80ff", // Light Red
    "#80cbc4ff", // Mint
    "#81c784ff", // Light Green
    "#ffb74dff", // Orange
    "#ba68c8ff", // Light Purple
    "#4fc3f7ff", // Cyan
    "#aed581ff", // Lime
    "#ffcc80ff", // Peach
    "#f48fb1ff", // Pink
    "#90a4aeff", // Blue Grey
  ];

  // Function to get consistent color for a class
  const getColorForClass = (className: string): string => {
    if (!className) return classColors[0];

    // Create a simple hash from the class name for consistent color assignment
    let hash = 0;
    for (let i = 0; i < className.length; i++) {
      hash = className.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % classColors.length;
    return classColors[colorIndex];
  };

  const classStats = useMemo<Record<string, ClassStat>>(() => {
    const accumulator: Record<
      string,
      { count: number; aiDetections: number; confidenceSum: number; confidences: number[] }
    > = {};

    const bump = (
      className: string,
      options?: { confidence?: number; trackConfidence?: boolean }
    ) => {
      const key = className || "Unknown";
      if (!accumulator[key]) {
        accumulator[key] = { count: 0, aiDetections: 0, confidenceSum: 0, confidences: [] };
      }
      accumulator[key].count += 1;
      if (options?.trackConfidence && typeof options.confidence === "number") {
        accumulator[key].aiDetections += 1;
        accumulator[key].confidenceSum += options.confidence;
        accumulator[key].confidences.push(options.confidence);
      }
    };

    if (showElectrical) {
      (detectionResults?.electricalPredictions ?? []).forEach((prediction: any) => {
        bump(prediction?.class ?? "Electrical", {
          confidence:
            typeof prediction?.confidence === "number" ? prediction.confidence : undefined,
          trackConfidence: true,
        });
      });
    } else {
      (detectionResults?.predictions ?? []).forEach((prediction: any, index: number) => {
        if (prediction?.source === "User") return;
        const detId = prediction?.id ? String(prediction.id) : `detection-${index}`;
        if (dismissedDetections.has(detId)) return;
        bump(prediction?.class ?? "Unknown", {
          confidence:
            typeof prediction?.confidence === "number" ? prediction.confidence : undefined,
          trackConfidence: true,
        });
      });

      userAnnotations.forEach((annotation) => {
        bump(annotation.class ?? "Unknown");
      });
    }

    return Object.fromEntries(
      Object.entries(accumulator).map(([key, value]) => {
        const avgConfidence =
          value.aiDetections > 0
            ? value.confidenceSum / value.aiDetections
            : null;
        return [key, { count: value.count, avgConfidence, confidences: value.confidences }];
      })
    );
  }, [
    showElectrical,
    detectionResults?.predictions,
    detectionResults?.electricalPredictions,
    userAnnotations,
    dismissedDetections,
  ]);

  // Reset zoom and position when image changes
  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setImagePosition({ x: 0, y: 0 });
    setSelectedClasses(new Set()); // Reset class filter on image change
    setSearchTerm(""); // Reset search term on image change
    setUserAnnotations([]); // Clear user annotations on image change
    setIsDrawing(false);
    setCurrentBox(null);
    setShowClassSelector(false);
    setPendingAnnotation(null);
    setShowDimensions(false); // Reset dimensions on image change
    setHoveredShapeId(null);
    setShapeTooltip(null);
    setMeasurements([]);
    setMeasurementDraft(null);
    setIsMeasuring(false);
    setAskAiOpen(false);
  }, [currentIndex]);

  // Update currentIndex when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (!showDimensions) {
      setHoveredShapeId(null);
      setShapeTooltip(null);
    }
  }, [showDimensions]);

  useEffect(() => {
    if (activeTool !== "linear" && activeTool !== "measure") {
      setIsMeasuring(false);
      setMeasurementDraft(null);
    }
  }, [activeTool]);

  useEffect(() => {
    if (!isOpen) {
      setIsMeasuring(false);
      setMeasurementDraft(null);
      setAskAiOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setMeasurements((prev) =>
      prev.map((measurement) => {
        const conversion = convertPixelDistance(measurement.lengthPx);
        if (
          conversion.formatted === measurement.label &&
          conversion.unit === measurement.unit &&
          conversion.hasCalibration === measurement.hasCalibration
        ) {
          return measurement;
        }
        return {
          ...measurement,
          value: conversion.value,
          unit: conversion.unit,
          label: conversion.formatted,
          hasCalibration: conversion.hasCalibration,
        };
      })
    );
  }, [convertPixelDistance]);

  useEffect(() => {
    if (userAnnotations.length === 0) return;
    setUserAnnotations((prev) =>
      prev.map((annotation) => {
        if (!annotation.points || annotation.points.length < 3) return annotation;
        const areaPx = computePolygonArea(annotation.points);
        const areaInfo = convertPixelArea(areaPx);
        const centroid =
          (annotation.meta?.centroid as MeasurementPoint | undefined) ??
          computePolygonCentroid(annotation.points);
        return {
          ...annotation,
          meta: {
            ...annotation.meta,
            areaPx,
            areaValue: areaInfo.value,
            areaUnit: areaInfo.unit,
            areaFormatted: areaInfo.formatted,
            areaCalibrated: areaInfo.hasCalibration,
            centroid,
          },
        };
      })
    );
  }, [convertPixelArea, computePolygonArea, computePolygonCentroid]);

  // Call API when current image changes or viewer opens
  useEffect(() => {
    if (isOpen && currentImage && onImageChange) {
      console.log(
        "=====> Calling API for image:",
        currentImage.name,
        "at index:",
        currentIndex
      );
      onImageChange(currentImage, currentIndex);
    }
  }, [currentIndex, isOpen]); // Removed currentImage and onImageChange from dependencies to avoid infinite loops

  // Load user annotations from detectionResults when detection data changes
  useEffect(() => {
    if (detectionResults?.predictions) {
      // Extract user annotations (those with source="User") from predictions
      const userAnns = detectionResults.predictions
        .filter((pred: any) => pred.source === "User")
        .map((pred: any) => ({
          x: pred.x || 0,
          y: pred.y || 0,
          width: pred.width || 0,
          height: pred.height || 0,
          class: pred.class,
          confidence: pred.confidence,
          color: getColorForClass(pred.class || "Unknown"),
          id: pred.id || `user-annotation-${Date.now()}-${Math.random()}`,
          points: pred.points || undefined,
          meta:
            Array.isArray(pred.points) && pred.points.length > 2
              ? (() => {
                const pts = pred.points as MeasurementPoint[];
                const areaPx = computePolygonArea(pts);
                const areaInfo = convertPixelArea(areaPx);
                const centroid = computePolygonCentroid(pts);
                return {
                  areaPx,
                  areaValue: areaInfo.value,
                  areaUnit: areaInfo.unit,
                  areaFormatted: areaInfo.formatted,
                  areaCalibrated: areaInfo.hasCalibration,
                  centroid,
                };
              })()
              : undefined,
        }));

      if (userAnns.length > 0) {
        setUserAnnotations(userAnns);
      }
    }
  }, [detectionResults, currentIndex, computePolygonArea, convertPixelArea, computePolygonCentroid]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          if (isMeasuring || measurementDraft) {
            e.preventDefault();
            setIsMeasuring(false);
            setMeasurementDraft(null);
            return;
          }
          onClose();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case "+":
        case "=":
          zoomIn();
          break;
        case "-":
          zoomOut();
          break;
        case "r":
        case "R":
          rotate();
          break;
      }
    },
    [isOpen, isMeasuring, measurementDraft, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Delete selected annotation with Delete/Backspace
  useEffect(() => {
    const onDel = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedOverlayId) {
        e.preventDefault();
        const isUser = userAnnotations.some((a) => a.id === selectedOverlayId);
        removeOverlayWithUndo(selectedOverlayId, isUser);
      }
    };
    window.addEventListener("keydown", onDel);
    return () => window.removeEventListener("keydown", onDel);
  }, [isOpen, selectedOverlayId, userAnnotations]);

  // Ctrl/Cmd+Z undo
  useEffect(() => {
    const onUndo = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undoLast();
      }
    };
    window.addEventListener("keydown", onUndo);
    return () => window.removeEventListener("keydown", onUndo);
  }, [isOpen, undoStack]);

  const deleteUserAnnotation = (id: string) => removeOverlayWithUndo(id, true);
  const dismissApiDetection = (id: string) => removeOverlayWithUndo(id, false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const zoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.5, 5));
  };

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.5, 0.1));
  };

  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const resetView = () => {
    setZoom(1);
    setRotation(0);
    setImagePosition({ x: 0, y: 0 });
  };

  const detectionContext = useMemo(() => {
    if (!currentImage) return null;

    const rawPredictions = Array.isArray(detectionResults?.predictions)
      ? detectionResults?.predictions ?? []
      : [];

    const normalizedPredictions: NormalizedDetectionSummary[] = rawPredictions
      .map((pred: any): NormalizedDetectionSummary => ({
        id: pred?.id ?? null,
        label: pred?.class ?? "Unknown",
        confidence: typeof pred?.confidence === "number" ? Number(pred.confidence.toFixed(4)) : null,
        source: pred?.source ?? "AI",
        center: {
          x: typeof pred?.x === "number" ? pred.x : 0,
          y: typeof pred?.y === "number" ? pred.y : 0,
        },
        size: {
          width: typeof pred?.width === "number" ? pred.width : 0,
          height: typeof pred?.height === "number" ? pred.height : 0,
        },
        polygon: Array.isArray(pred?.points)
          ? (pred.points as Array<{ x: number; y: number }>).slice(0, 20).map((pt) => ({
            x: typeof pt?.x === "number" ? pt.x : 0,
            y: typeof pt?.y === "number" ? pt.y : 0,
          }))
          : null,
        pageNumber: pred?.pageNumber ?? currentImage.pageNumber ?? null,
      }))
      .slice(0, 200);

    const normalizedAnnotations: NormalizedAnnotationSummary[] = userAnnotations.map((ann) => ({
      id: ann.id,
      label: ann.class ?? "Unknown",
      confidence: typeof ann.confidence === "number" ? Number(ann.confidence.toFixed(4)) : null,
      center: { x: ann.x, y: ann.y },
      size: { width: ann.width, height: ann.height },
      polygon: ann.points ? ann.points.slice(0, 20) : null,
      meta: ann.meta ?? null,
    }));

    const measurementSummaries: MeasurementSummary[] = measurements.map((measurement) => ({
      id: measurement.id,
      start: measurement.start,
      end: measurement.end,
      lengthPx: Number(measurement.lengthPx.toFixed(2)),
      value: Number(measurement.value.toFixed(4)),
      unit: measurement.unit,
      label: measurement.label,
      calibrated: measurement.hasCalibration,
    }));

    const dimensionShapes = Array.isArray(detectionResults?.shapes)
      ? (detectionResults?.shapes as Array<any>).slice(0, 80).map((shape, index) => ({
        id: shape?.id ?? `shape-${index}`,
        type: shape?.type ?? "polygon",
        label: shape?.label ?? shape?.name ?? null,
        points: Array.isArray(shape?.points)
          ? (shape.points as Array<{ x: number; y: number }>).slice(0, 40)
          : null,
        area: typeof shape?.area === "number" ? Number(shape.area.toFixed(2)) : null,
        meta: shape?.meta ?? null,
      }))
      : [];

    const classBreakdown: Record<string, number> = {};
    normalizedPredictions.forEach((pred) => {
      const key = pred.label ?? "Unknown";
      classBreakdown[key] = (classBreakdown[key] ?? 0) + 1;
    });
    normalizedAnnotations.forEach((ann) => {
      const key = ann.label ?? "Unknown";
      classBreakdown[key] = (classBreakdown[key] ?? 0) + 1;
    });

    return {
      image: {
        id: currentImage.id,
        name: currentImage.name,
        pageNumber: currentImage.pageNumber ?? null,
      },
      generatedAt: new Date().toISOString(),
      calibration: calibrationInfo
        ? {
          unit: calibrationInfo.unit,
          unitsPerPixel: calibrationInfo.unitsPerPixel,
          pixelsPerUnit: calibrationInfo.pixelsPerUnit,
        }
        : null,
      stats: {
        totalPredictions: normalizedPredictions.length,
        totalUserAnnotations: normalizedAnnotations.length,
        totalMeasurements: measurements.length,
        classBreakdown,
      },
      predictions: normalizedPredictions,
      userAnnotations: normalizedAnnotations,
      measurements: measurementSummaries,
      dimensionShapes,
    };
  }, [currentImage, detectionResults, userAnnotations, measurements, calibrationInfo]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (activeTool === "linear" || activeTool === "measure") {
      const imageRect = e.currentTarget.getBoundingClientRect();

      if (imageRect && imageDimensions.width > 0) {
        const scaleX = imageDimensions.width / imageRect.width;
        const scaleY = imageDimensions.height / imageRect.height;

        const x = (e.clientX - imageRect.left) * scaleX;
        const y = (e.clientY - imageRect.top) * scaleY;

        if (!isMeasuring || !measurementDraft) {
          const startPoint = { x, y };
          setMeasurementDraft({
            id: `measurement-${Date.now()}`,
            start: startPoint,
            end: startPoint,
          });
          setIsMeasuring(true);
        } else {
          const endPoint = { x, y };
          const dx = endPoint.x - measurementDraft.start.x;
          const dy = endPoint.y - measurementDraft.start.y;
          const lengthPx = Math.sqrt(dx * dx + dy * dy);

          if (lengthPx >= 1) {
            const conversion = convertPixelDistance(lengthPx);
            const measurement: MeasurementOverlay = {
              id: measurementDraft.id,
              start: measurementDraft.start,
              end: endPoint,
              lengthPx,
              value: conversion.value,
              unit: conversion.unit,
              label: conversion.formatted,
              hasCalibration: conversion.hasCalibration,
            };
            setMeasurements((prev) => [...prev, measurement]);
          }

          setMeasurementDraft(null);
          setIsMeasuring(false);
        }
      }
      return;
    }

    if (activeTool === "annotate") {
      const imageRect = e.currentTarget.getBoundingClientRect();

      if (imageRect && imageDimensions.width > 0) {
        const scaleX = imageDimensions.width / imageRect.width;
        const scaleY = imageDimensions.height / imageRect.height;

        const x = (e.clientX - imageRect.left) * scaleX;
        const y = (e.clientY - imageRect.top) * scaleY;

        setIsDrawing(true);
        setStartPoint({ x, y });
        setCurrentBox({
          x,
          y,
          width: 0,
          height: 0,
        });
      }
    } else if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y,
      });
    } else if (activeTool === "polygon") {
      // Add or start-dragging a polygon point (convert to image pixel coordinates)
      const imageRect = (e.currentTarget as Element).getBoundingClientRect();
      if (imageRect && imageDimensions.width > 0) {
        const scaleX = imageDimensions.width / imageRect.width;
        const scaleY = imageDimensions.height / imageRect.height;
        const x = (e.clientX - imageRect.left) * scaleX;
        const y = (e.clientY - imageRect.top) * scaleY;

        // If clicking near an existing point, start dragging that point
        const hitIndex = polygonPoints.findIndex((p) => {
          const dx = p.x - x;
          const dy = p.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          return dist <= 12; // hit radius in image pixels
        });

        if (hitIndex !== -1) {
          setDraggingPointIndex(hitIndex);
        } else {
          setPolygonPoints((prev) => [...prev, { x, y }]);
        }
      }
    } else {
      // Check if clicking on a saved polygon annotation's corner point to edit it
      const imageRect = (e.currentTarget as Element).getBoundingClientRect();
      if (imageRect && imageDimensions.width > 0) {
        const scaleX = imageDimensions.width / imageRect.width;
        const scaleY = imageDimensions.height / imageRect.height;
        const x = (e.clientX - imageRect.left) * scaleX;
        const y = (e.clientY - imageRect.top) * scaleY;

        // Find if clicking on a corner point of any saved polygon annotation
        for (const annotation of userAnnotations) {
          if (annotation.points && annotation.points.length > 0) {
            const hitIndex = annotation.points.findIndex((p) => {
              const dx = p.x - x;
              const dy = p.y - y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              return dist <= 12;
            });

            if (hitIndex !== -1) {
              setEditingAnnotationId(annotation.id);
              setDraggingPointIndex(hitIndex);
              break;
            }
          }
        }
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (activeTool === "annotate" && isDrawing) {
      const imageRect = e.currentTarget.getBoundingClientRect();

      if (imageRect && imageDimensions.width > 0) {
        const scaleX = imageDimensions.width / imageRect.width;
        const scaleY = imageDimensions.height / imageRect.height;

        const currentX = (e.clientX - imageRect.left) * scaleX;
        const currentY = (e.clientY - imageRect.top) * scaleY;

        setCurrentBox({
          x: Math.min(startPoint.x, currentX),
          y: Math.min(startPoint.y, currentY),
          width: Math.abs(currentX - startPoint.x),
          height: Math.abs(currentY - startPoint.y),
        });
      }
    } else if ((activeTool === "linear" || activeTool === "measure") && isMeasuring && measurementDraft) {
      const imageRect = e.currentTarget.getBoundingClientRect();
      if (imageRect && imageDimensions.width > 0) {
        const scaleX = imageDimensions.width / imageRect.width;
        const scaleY = imageDimensions.height / imageRect.height;
        const x = (e.clientX - imageRect.left) * scaleX;
        const y = (e.clientY - imageRect.top) * scaleY;

        setMeasurementDraft((prev) =>
          prev
            ? {
              ...prev,
              end: { x, y },
            }
            : prev
        );
      }
    } else if (draggingPointIndex !== null) {
      // move the dragged polygon point
      const imageRect = e.currentTarget.getBoundingClientRect();
      if (imageRect && imageDimensions.width > 0) {
        const scaleX = imageDimensions.width / imageRect.width;
        const scaleY = imageDimensions.height / imageRect.height;
        const x = (e.clientX - imageRect.left) * scaleX;
        const y = (e.clientY - imageRect.top) * scaleY;

        if (editingAnnotationId) {
          // Edit a saved annotation's point
          setUserAnnotations((prev) => prev.map((ann) => {
            if (ann.id === editingAnnotationId && ann.points) {
              const newPoints = [...ann.points];
              if (draggingPointIndex >= 0 && draggingPointIndex < newPoints.length) {
                newPoints[draggingPointIndex] = { x, y };
              }
              return { ...ann, points: newPoints };
            }
            return ann;
          }));
        } else {
          // Edit in-progress polygon points
          setPolygonPoints((prev) => {
            const next = prev.slice();
            if (draggingPointIndex! >= 0 && draggingPointIndex! < next.length) {
              next[draggingPointIndex!] = { x, y };
            }
            return next;
          });
        }
      }
    } else if (isDragging && zoom > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    if (activeTool === "annotate" && isDrawing && currentBox) {
      // Only create annotation if box has meaningful size
      if (currentBox.width > 10 && currentBox.height > 10) {
        setPendingAnnotation(currentBox);
        setShowClassSelector(true);
      }
      setIsDrawing(false);
      setCurrentBox(null);
    } else {
      setIsDragging(false);
    }
    // stop dragging polygon points when mouse is released
    if (draggingPointIndex !== null) {
      setDraggingPointIndex(null);
      setEditingAnnotationId(null);
    }
  };

  const updateShapeTooltip = useCallback(
    (
      event: React.MouseEvent<SVGPathElement, MouseEvent>,
      name: string,
      areaText: string | undefined,
      color: string
    ) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pointerX = event.clientX - rect.left;
      const pointerY = event.clientY - rect.top;

      setShapeTooltip({
        x: pointerX,
        y: pointerY,
        name,
        area: areaText,
        color,
      });
    },
    []
  );

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  };

  const getDetectionBoxes = (): Detection[] => {
    if (!detectionResults?.predictions || !showDetections) return [];

    const allBoxes = detectionResults.predictions
      // Filter out user annotations - they're handled separately in userAnnotations state
      .filter((detection: any) => detection.source !== "User")
      .map(
        (detection: any, index: number): Detection => {
          const className = detection.class || "Unknown";
          const color = getColorForClass(className);

          return {
            x: detection.x || 0,
            y: detection.y || 0,
            width: detection.width || 0,
            height: detection.height || 0,
            class: detection.class,
            confidence: detection.confidence,
            color,
            id: detection.id ? String(detection.id) : `detection-${index}`,
            points: detection.points || undefined, // Preserve points if present
          };
        }
      );

    // Remove dismissed detections
    const visibleBoxes = allBoxes.filter((box: Detection) => !dismissedDetections.has(box.id));

    // Filter by selected classes if any are selected
    if (selectedClasses.size === 0) {
      return visibleBoxes; // Show all if none selected
    }
    return visibleBoxes.filter((box: Detection) =>
      selectedClasses.has(box.class || "Unknown")
    );
  };

  const getClassCounts = (): { [key: string]: number } => {
    const entries = Object.entries(classStats);
    return Object.fromEntries(entries.map(([className, stats]) => [className, stats.count]));
  };

  const getClassSummary = (): string => {
    const counts = getClassCounts();
    const summaryParts = Object.entries(counts).map(
      ([className, count]) => `${className} ${count}`
    );
    return summaryParts.join(", ");
  };

  const toggleClassSelection = (className: string) => {
    setSelectedClasses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(className)) {
        newSet.delete(className);
      } else {
        newSet.add(className);
      }
      return newSet;
    });
  };

  // Filter classes based on search term
  const getFilteredClasses = (): Record<string, ClassStat> => {
    const entries = Object.entries(classStats);
    if (!searchTerm.trim()) {
      return Object.fromEntries(entries);
    }

    const lowercaseTerm = searchTerm.toLowerCase();
    return Object.fromEntries(
      entries.filter(([className]) =>
        className.toLowerCase().includes(lowercaseTerm)
      )
    );
  };

  // Add new custom class
  const handleAddNewClass = () => {
    if (newClassName.trim() && !customClasses.includes(newClassName.trim())) {
      setCustomClasses((prev) => [...prev, newClassName.trim()]);
      setNewClassName("");
      setShowAddClassModal(false);
    }
  };

  // Get all available classes (detected + custom)
  const getAllAvailableClasses = () => {
    const detectedClasses = Object.keys(getClassCounts());
    return [...new Set([...detectedClasses, ...customClasses])];
  };

  // Handle annotation class assignment
  const handleAssignClass = (className: string) => {
    if (pendingAnnotation) {
      const newAnnotation: Detection = {
        ...pendingAnnotation,
        class: className,
        confidence: 1.0,
        color: getColorForClass(className),
        id: `user-annotation-${Date.now()}`,
        // Explicitly preserve points if they exist
        points: pendingAnnotation.points || undefined,
      };

      setUserAnnotations((prev) => [...prev, newAnnotation]);
      setPendingAnnotation(null);
      setShowClassSelector(false);
      setSelectedAnnotationClass("");
    }
  };

  // Finish polygon: convert polygonPoints into a pendingAnnotation then open class selector
  const finishPolygon = () => {
    if (!polygonPoints || polygonPoints.length < 3) {
      console.warn('Not enough points to create polygon:', polygonPoints.length);
      return;
    }
    // compute bounding box and centroid
    const xs = polygonPoints.map((p) => p.x);
    const ys = polygonPoints.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const width = maxX - minX;
    const height = maxY - minY;
    const centroid = computePolygonCentroid(polygonPoints);
    const areaPx = computePolygonArea(polygonPoints);
    const areaInfo = convertPixelArea(areaPx);

    const ann = {
      x: centroid.x,
      y: centroid.y,
      width,
      height,
      points: [...polygonPoints], // Create a copy of the points array
      meta: {
        areaPx,
        areaValue: areaInfo.value,
        areaUnit: areaInfo.unit,
        areaFormatted: areaInfo.formatted,
        areaCalibrated: areaInfo.hasCalibration,
        centroid,
      },
    } as any;

    setPendingAnnotation(ann);
    setShowClassSelector(true);
    setPolygonPoints([]);
  };

  const cancelPolygon = () => {
    setPolygonPoints([]);
  };

  // Handle creating new class for annotation
  const handleCreateNewClassForAnnotation = () => {
    if (selectedAnnotationClass.trim() && pendingAnnotation) {
      // Add to custom classes if not already there
      if (!customClasses.includes(selectedAnnotationClass.trim())) {
        setCustomClasses((prev) => [...prev, selectedAnnotationClass.trim()]);
      }

      const newAnnotation: Detection = {
        ...pendingAnnotation,
        class: selectedAnnotationClass.trim(),
        confidence: 1.0,
        color: getColorForClass(selectedAnnotationClass.trim()),
        id: `user-annotation-${Date.now()}`,
        // Explicitly preserve points if they exist
        points: pendingAnnotation.points || undefined,
      };

      setUserAnnotations((prev) => [...prev, newAnnotation]);
      setPendingAnnotation(null);
      setShowClassSelector(false);
      setSelectedAnnotationClass("");
    }
  };

  // Get combined detection boxes (original + user annotations)
  const getCombinedDetectionBoxes = (): Detection[] => {
    const originalBoxes = getDetectionBoxes();

    // Filter user annotations by selected classes if any are selected
    let filteredUserAnnotations = userAnnotations;
    if (selectedClasses.size > 0) {
      filteredUserAnnotations = userAnnotations.filter((annotation) =>
        selectedClasses.has(annotation.class || "Unknown")
      );
    }

    // Build electrical boxes
    let electricalBoxes: Detection[] = [];
    if (detectionResults?.electricalPredictions) {
      electricalBoxes = (detectionResults.electricalPredictions || []).map((p: any, i: number) => ({
        x: p.x || 0,
        y: p.y || 0,
        width: p.width || 0,
        height: p.height || 0,
        class: p.class || "Electrical",
        confidence: p.confidence,
        color: getColorForClass(`electrical:${p.class || 'Electrical'}`),
        id: p.id ? String(p.id) : `electrical-${i}`,
        points: undefined,
      }));

      if (selectedClasses.size > 0) {
        electricalBoxes = electricalBoxes.filter((b: Detection) => selectedClasses.has(b.class || "Unknown"));
      }
    }

    // If electrical-only mode is enabled, return only electrical boxes
    if (showElectrical) {
      return electricalBoxes;
    }

    return [...originalBoxes, ...filteredUserAnnotations];
  };

  // Generate SVG overlay from detection results and user annotations
  const generateSvgOverlay = useCallback(() => {
    if (!imageDimensions.width || !imageDimensions.height) return null;

    // Get detection boxes directly here to avoid dependency issues
    let allDetections: Detection[] = [];

    // Get original detections
    if (detectionResults?.predictions && showDetections && !showElectrical) {
      const originalBoxes = detectionResults.predictions.map(
        (detection: any, index: number): Detection => {
          const className = detection.class || "Unknown";
          const color = getColorForClass(className);

          return {
            x: detection.x || 0,
            y: detection.y || 0,
            width: detection.width || 0,
            height: detection.height || 0,
            class: detection.class,
            confidence: detection.confidence,
            color,
            id: `detection-${index}`,
          };
        }
      );

      // Filter by selected classes if any are selected
      if (selectedClasses.size === 0) {
        allDetections = [...allDetections, ...originalBoxes];
      } else {
        allDetections = [...allDetections, ...originalBoxes.filter((box: Detection) =>
          selectedClasses.has(box.class || "Unknown")
        )];
      }
    }

    // If electrical-only mode is enabled, add only electrical predictions
    if (showElectrical && detectionResults?.electricalPredictions) {
      const elBoxes = (detectionResults.electricalPredictions || []).map((p: any, i: number): Detection => ({
        x: p.x || 0,
        y: p.y || 0,
        width: p.width || 0,
        height: p.height || 0,
        class: p.class || "Electrical",
        confidence: p.confidence,
        color: getColorForClass(`electrical:${p.class || 'Electrical'}`),
        id: p.id ? String(p.id) : `electrical-${i}`,
      }));

      if (selectedClasses.size === 0) {
        allDetections = [...allDetections, ...elBoxes];
      } else {
        allDetections = [...allDetections, ...elBoxes.filter((b: Detection) => selectedClasses.has(b.class || "Unknown"))];
      }
    }

    // Add user annotations
    let filteredUserAnnotations = userAnnotations;
    if (selectedClasses.size > 0) {
      filteredUserAnnotations = userAnnotations.filter((annotation) =>
        selectedClasses.has(annotation.class || "Unknown")
      );
    }
    allDetections = [...allDetections, ...filteredUserAnnotations];

    if (allDetections.length === 0) return null;

    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" 
           width="${imageDimensions.width}" 
           height="${imageDimensions.height}" 
           viewBox="0 0 ${imageDimensions.width} ${imageDimensions.height}">
        ${allDetections.map(detection => `
          <rect x="${detection.x - detection.width / 2}" 
                y="${detection.y - detection.height / 2}" 
                width="${detection.width}" 
                height="${detection.height}" 
                fill="none" 
                stroke="${detection.color}" 
                stroke-width="2" 
                opacity="0.8"/>
          ${detection.class ? `
            <text x="${detection.x - detection.width / 2}" 
                  y="${detection.y - detection.height / 2 - 5}" 
                  font-family="Arial, sans-serif" 
                  font-size="12" 
                  fill="${detection.color}" 
                  font-weight="bold">
              ${detection.class}${detection.confidence ? ` (${Math.round(detection.confidence * 100)}%)` : ''}
            </text>
          ` : ''}
        `).join('')}
      </svg>
    `;

    return svgContent;
  }, [imageDimensions.width, imageDimensions.height, detectionResults, userAnnotations, selectedClasses, showDetections]);

  // Update SVG overlay when detections change
  useEffect(() => {
    if (onSvgOverlayUpdate && currentImage) {
      const svgData = generateSvgOverlay();
      onSvgOverlayUpdate(currentImage.id, svgData);
    }
  }, [generateSvgOverlay, currentImage?.id, onSvgOverlayUpdate]);


  // Toolbar action handlers
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = currentImage.path;
    link.download = currentImage.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Blueprint: ${currentImage.name}`,
        url: currentImage.path,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(currentImage.path);
      // You could show a toast notification here
      alert("Blueprint link copied to clipboard!");
    }
  };

  const handleToggleGrid = () => {
    setShowGrid(!showGrid);
  };

  const handleAnnotate = () => {
    console.log("Starting annotation mode");
    // Implementation for annotation functionality
  };

  const handleMeasure = () => {
    console.log("Starting measurement mode");
    // Implementation for measurement functionality
  };

  const handleAddNote = () => {
    console.log("Adding note/pin");
    // Implementation for adding notes/pins
  };

  const handleCalculate = () => {
    console.log("Opening calculator");
    // Implementation for calculator functionality
  };

  // Build a combined, export-friendly list of detections (AI visible + user annotations)
  const getAllDetectionsForExport = (): Array<{
    id: string;
    source: "AI" | "User";
    className: string;
    confidence?: number;
    x: number; // center-x in image pixels
    y: number; // center-y in image pixels
    width: number;
    height: number;
    pageNumber?: number;
  }> => {
    const ai = (detectionResults?.predictions || [])
      .filter((det: any, index: number) => {
        // Skip user annotations - they're handled separately below
        if (det.source === "User") return false;

        const detId = det.id ? String(det.id) : `detection-${index}`;
        return !dismissedDetections.has(detId);
      })
      .map((det: any, index: number) => ({
        id: det.id ? String(det.id) : `detection-${index}`,
        source: "AI" as const,
        className: det.class || "Unknown",
        confidence: det.confidence,
        x: det.x || 0,
        y: det.y || 0,
        width: det.width || 0,
        height: det.height || 0,
        pageNumber: currentImage?.pageNumber,
      }));

    const user = userAnnotations.map((a) => ({
      id: a.id,
      source: "User" as const,
      className: a.class || "Unknown",
      confidence: a.confidence,
      x: a.x,
      y: a.y,
      width: a.width,
      height: a.height,
      pageNumber: currentImage?.pageNumber,
      points: a.points ?? undefined,
    }));

    return [...ai, ...user];
  };

  // Notify parent when the combined detections (AI + user annotations) change
  useEffect(() => {
    if (onDetectionsChange && currentImage) {
      try {
        const combined = getAllDetectionsForExport();
        onDetectionsChange(currentImage.id, combined);
      } catch (e) {
        // swallow errors here; parent doesn't need to crash the viewer
        // eslint-disable-next-line no-console
        console.error("onDetectionsChange error:", e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentImage?.id, userAnnotations, detectionResults, selectedClasses, dismissedDetections]);

  // Export: draw base image + overlay to canvas, embed into PDF, download; also allow CSV export
  const handleExportPdf = async () => {
    try {
      // Load base image with CORS enabled for canvas drawing
      const imgEl = await new Promise<HTMLImageElement>((resolve, reject) => {
        const im = new Image();
        im.crossOrigin = "anonymous";
        im.onload = () => resolve(im);
        im.onerror = reject;
        im.src = currentImage.path;
      });

      const width = imgEl.naturalWidth || imgEl.width;
      const height = imgEl.naturalHeight || imgEl.height;
      if (!width || !height) throw new Error("Image dimensions unavailable");

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D context not available");

      // Draw image
      ctx.drawImage(imgEl, 0, 0, width, height);

      // Draw overlay rectangles using center-based coords
      const overlays = getAllDetectionsForExport();
      overlays.forEach((d) => {
        const left = d.x - d.width / 2;
        const top = d.y - d.height / 2;
        // Outline
        ctx.strokeStyle = getColorForClass(d.className);
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.9;
        ctx.strokeRect(left, top, d.width, d.height);
        // Fill lite
        ctx.fillStyle = getColorForClass(d.className);
        ctx.globalAlpha = 0.18;
        ctx.fillRect(left, top, d.width, d.height);
        // Label
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#111827"; // slate-900 for legibility
        ctx.font = "bold 18px Arial";
        const label = `${d.className}${typeof d.confidence === "number" ? ` (${Math.round(d.confidence * 100)}%)` : ""}`;
        ctx.fillText(label, left + 4, Math.max(14, top - 6));
      });

      // Create PDF from canvas
      // @ts-ignore - jsPDF types may not be available at runtime until installed
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "px", format: [width, height], orientation: width >= height ? "l" : "p" });
      const imgData = canvas.toDataURL("image/png");
      doc.addImage(imgData, "PNG", 0, 0, width, height);
      const filename = `${(currentImage.name || "blueprint").replace(/\s+/g, "_")}.pdf`;
      doc.save(filename);
    } catch (e) {
      console.error("Failed to export PDF:", e);
      alert("Failed to export PDF. See console for details.");
    }
  };

  const handleExportCsv = () => {
    try {
      const rows = getAllDetectionsForExport();
      const headers = [
        "id",
        "source",
        "class",
        "confidence",
        "x_center",
        "y_center",
        "width",
        "height",
        "page",
        "image_name",
      ];
      const escapeCsv = (v: any) => {
        const s = v == null ? "" : String(v);
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const lines = [headers.join(",")];
      rows.forEach((r) => {
        lines.push([
          r.id,
          r.source,
          r.className,
          typeof r.confidence === "number" ? r.confidence.toFixed(4) : "",
          r.x,
          r.y,
          r.width,
          r.height,
          r.pageNumber ?? "",
          currentImage.name,
        ].map(escapeCsv).join(","));
      });
      const csv = lines.join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(currentImage.name || "annotations").replace(/\s+/g, "_")}_annotations.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to export CSV:", e);
      alert("Failed to export CSV. See console for details.");
    }
  };

  if (!isOpen || !currentImage) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white bg-opacity-95 flex items-center justify-center">
      {/* Header */}
      <FullScreenImageHeader
        currentImageName={currentImage.name}
        zoom={zoom}
        onZoomOut={zoomOut}
        onZoomIn={zoomIn}
        onRotate={rotate}
        onResetView={resetView}
        showDimensions={showDimensions}
        onToggleDimensions={() => setShowDimensions((s) => !s)}
        onAskAiOpen={() => setAskAiOpen(true)}
        onExportCsv={handleExportCsv}
        onClose={onClose}
        polygonPointsLength={polygonPoints.length}
        onFinishPolygon={finishPolygon}
        onCancelPolygon={cancelPolygon}
      />

      {/* Left Toolbar */}
      {leftToolbarOpen && (
        <div className="absolute left-6 top-44 bottom-0  z-20">
          <RightToolbar
            activeTool={activeTool}
            setTool={setActiveTool}
            onAnnotate={handleAnnotate}
            onMeasure={handleMeasure}
            onDownload={handleDownload}
            onShare={handleShare}
            onToggleGrid={handleToggleGrid}
            onAddNote={handleAddNote}
            onCalculate={handleCalculate}
            showGrid={showGrid}
            className=" shadow-xl border border-gray-200"
          />
        </div>
      )}

      {/* Image Container */}
      <div
        className={`flex-1 flex items-center justify-center relative ${leftToolbarOpen ? "-pl-56 -ml-56 pr-16 mt-10" : "p-16"
          }`}
        style={{
          cursor:
            activeTool === "annotate" ||
              activeTool === "polygon" ||
              activeTool === "linear" ||
              activeTool === "measure"
              ? "crosshair"
              : activeTool === "erase"
                ? "pointer"
                : zoom > 1
                  ? isDragging
                    ? "grabbing"
                    : "grab"
                  : "default",
        }}
      >
        {/* Fixed Gradient Overlay tied to the viewport, not the image */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-20"></div>

        <div
          ref={containerRef}
          className="relative"
          onMouseDown={activeTool !== "annotate" ? handleMouseDown : undefined}
          onMouseMove={activeTool !== "annotate" ? handleMouseMove : undefined}
          onMouseUp={activeTool !== "annotate" ? handleMouseUp : undefined}
          onMouseLeave={activeTool !== "annotate" ? handleMouseUp : undefined}
        >

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImage.path}
            alt={currentImage.name}
            className="max-w-full max-h-full object-contain transition-transform duration-200 select-none"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg) translate(${imagePosition.x / zoom
                }px, ${imagePosition.y / zoom}px)`,
              cursor:
                activeTool === "annotate" ||
                  activeTool === "polygon" ||
                  activeTool === "linear" ||
                  activeTool === "measure"
                  ? "crosshair"
                  : zoom > 1
                    ? isDragging
                      ? "grabbing"
                      : "grab"
                    : "default",
            }}
            onLoad={handleImageLoad}
            onMouseDown={
              activeTool === "annotate" || activeTool === "polygon" ? handleMouseDown : undefined
            }
            onMouseMove={
              activeTool === "annotate" ? handleMouseMove : undefined
            }
            onMouseUp={activeTool === "annotate" ? handleMouseUp : undefined}
            onMouseLeave={activeTool === "annotate" ? handleMouseUp : undefined}
            onError={(e) => {
              e.currentTarget.src =
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==";
            }}
            draggable={false}
          />

          {/* Dimension Shapes Overlay */}
          {showDimensions && detectionResults?.shapes && imageDimensions.width > 0 && (
            <svg
              className="absolute top-0 left-0"
              style={{
                width: "100%",
                height: "100%",
                transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                pointerEvents: "auto",
              }}
              viewBox={`0 0 ${imageDimensions.width} ${imageDimensions.height}`}
              preserveAspectRatio="xMidYMid meet"
              onMouseLeave={() => {
                setHoveredShapeId(null);
                setShapeTooltip(null);
              }}
            >
              {detectionResults.shapes.map((shape: any, idx: number) => {
                const fillColor = shape.color || "#00ff00";
                const numericArea = typeof shape.area === "number"
                  ? shape.area
                  : typeof shape.meta?.area === "number"
                    ? shape.meta.area
                    : undefined;
                const areaLabel = typeof numericArea === "number"
                  ? `${areaFormatter.format(numericArea)} sq units`
                  : undefined;
                const displayName =
                  typeof shape.label === "string" && shape.label.trim()
                    ? shape.label
                    : `Dimension ${idx + 1}`;
                const shapeId = String(shape.id ?? `dim-shape-${idx}`);
                const isHovered = hoveredShapeId === shapeId;

                return (
                  <path
                    key={shapeId}
                    d={shape.path}
                    fill={fillColor}
                    fillOpacity={isHovered ? 0.35 : 0.12}
                    stroke={fillColor}
                    strokeWidth={isHovered ? 3 : 2}
                    strokeOpacity={isHovered ? 1 : 0.85}
                    style={{ pointerEvents: "visiblePainted", cursor: areaLabel ? "crosshair" : "pointer", transition: "fill-opacity 120ms ease, stroke-opacity 120ms ease, stroke-width 120ms ease" }}
                    onMouseEnter={(event) => {
                      setHoveredShapeId(shapeId);
                      updateShapeTooltip(event, displayName, areaLabel, fillColor);
                    }}
                    onMouseMove={(event) => {
                      if (hoveredShapeId === shapeId) {
                        updateShapeTooltip(event, displayName, areaLabel, fillColor);
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredShapeId((prev) => (prev === shapeId ? null : prev));
                      setShapeTooltip(null);
                    }}
                    aria-label={areaLabel ? `Dimension shape with area ${areaLabel}` : undefined}
                  >
                    {areaLabel && <title>{`Area: ${areaLabel}`}</title>}
                  </path>
                );
              })}
            </svg>
          )}

          {/* Detection Overlay */}
          {imageDimensions.width > 0 && (
            <svg
              className={`absolute inset-0 ${activeTool === "annotate"
                ? "pointer-events-none"
                : "pointer-events-none"
                }`}
              style={{
                width: "100%",
                height: "100%",
                transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              }}
              viewBox={`0 0 ${imageDimensions.width} ${imageDimensions.height}`}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Original detections and user annotations */}
              {showDetections &&
                getCombinedDetectionBoxes().map((detection: any) => {
                  // Check if this is a user annotation
                  const isUserAnnotation =
                    detection.id.startsWith("user-annotation-");

                  // Apply different positioning logic for user annotations vs original detections
                  let xShift, yShift;

                  if (isUserAnnotation) {
                    // For user annotations: simple offset down and right
                    xShift = -1; // Move 10 pixels to the right
                    yShift = -1; // Move 10 pixels down
                  } else {
                    // For original detections: keep the existing complex calculation
                    const shiftRatio =
                      Math.log2(
                        detection.width * 20000000000000000000000000000
                      ) / 200; // non-linear smooth scaling
                    xShift = detection.width * shiftRatio;
                    yShift = detection.height * shiftRatio;
                  }

                  const xRect = detection.x - xShift;
                  const yRect = detection.y - yShift;
                  const isSelected = selectedOverlayId === detection.id;
                  let userPolygonAreaLabel: string | undefined;
                  let userPolygonCentroid: MeasurementPoint | null = null;

                  if (isUserAnnotation && detection.points && detection.points.length > 2) {
                    userPolygonAreaLabel =
                      typeof detection.meta?.areaFormatted === "string"
                        ? detection.meta.areaFormatted
                        : typeof detection.meta?.areaLabel === "string"
                          ? detection.meta.areaLabel
                          : undefined;

                    userPolygonCentroid =
                      (detection.meta?.centroid as MeasurementPoint | undefined) ??
                      computePolygonCentroid(detection.points);
                  }

                  const labelX = xRect;
                  const labelY = yRect - 6;
                  const hasConfidence = typeof detection.confidence === "number";
                  return (
                    <g key={detection.id} style={{ pointerEvents: isUserAnnotation || activeTool === "erase" ? "auto" : "none", cursor: activeTool === "erase" ? "not-allowed" : isUserAnnotation ? "pointer" : "default" }}
                      onClick={() => {
                        if (activeTool === "erase") {
                          removeOverlayWithUndo(detection.id, !!isUserAnnotation);
                        } else if (isUserAnnotation) {
                          setSelectedOverlayId(detection.id);
                        }
                      }}
                      onContextMenu={(e) => {
                        if (isUserAnnotation || activeTool === "erase") {
                          e.preventDefault();
                          removeOverlayWithUndo(detection.id, !!isUserAnnotation);
                        }
                      }}
                    >
                      {/* Bounding box rectangle OR polygon */}
                      {detection.points && detection.points.length > 0 ? (
                        <>
                          {/* Render polygon shape */}
                          <polygon
                            points={detection.points.map((p: any) => `${p.x},${p.y}`).join(" ")}
                            fill={detection.color}
                            fillOpacity={isSelected ? 0.25 : 0.2}
                            stroke={isSelected ? "#22c55e" : detection.color}
                            strokeWidth={isSelected ? 3 : 2}
                            strokeOpacity={0.9}
                          />
                          {/* Show corner handles for user annotations */}
                          {isUserAnnotation && detection.points.map((p: any, idx: any) => (
                            <g key={`handle-${idx}`}>
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r={6}
                                fill="white"
                                stroke={detection.color}
                                strokeWidth={2}
                                style={{ pointerEvents: 'auto', cursor: 'move' }}
                              />
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r={2.5}
                                fill={detection.color}
                                style={{ pointerEvents: 'none' }}
                              />
                            </g>
                          ))}
                          {isUserAnnotation && userPolygonAreaLabel && userPolygonCentroid && (
                            <text
                              x={userPolygonCentroid.x}
                              y={userPolygonCentroid.y}
                              fill="#f8fafc"
                              fontSize={14}
                              fontWeight="bold"
                              textAnchor="middle"
                              style={{ paintOrder: 'stroke', stroke: 'rgba(15,23,42,0.85)', strokeWidth: 4 }}
                            >
                              {userPolygonAreaLabel}
                            </text>
                          )}
                        </>
                      ) : (
                        <>
                          <rect
                            x={xRect}
                            y={yRect}
                            width={detection.width}
                            height={detection.height}
                            fill="none"
                            stroke={isSelected ? "#22c55e" : detection.color}
                            strokeWidth={isSelected ? 2 : 1}
                            strokeOpacity="0.7"
                          />
                          <rect
                            x={xRect}
                            y={yRect}
                            width={detection.width}
                            height={detection.height}
                            fill={detection.color}
                            fillOpacity={isSelected ? 0.2 : 0.3}
                          />
                        </>
                      )}
                      {isUserAnnotation && activeTool !== "erase" && (
                        <g>
                          {/* Small delete chip at top-right */}
                          {/* delete chip position: for polygons place at first point's position */}
                          {detection.points && detection.points.length > 0 ? (
                            <>
                              {/* <rect
                                x={detection.points[0].x - 9}
                                y={detection.points[0].y - 9}
                                width={18}
                                height={18}
                                rx={3}
                                ry={3}
                                fill="#1a1010ff"
                                opacity="0.9"
                                style={{ pointerEvents: "auto" }}
                                onClick={(e) => { e.stopPropagation(); deleteUserAnnotation(detection.id); }}
                              />
                              <text
                                x={detection.points[0].x}
                                y={detection.points[0].y + 4}
                                textAnchor="middle"
                                fontSize="12"
                                fontFamily="Arial, sans-serif"
                                fill="#ffffff"
                                style={{ pointerEvents: "none" }}
                              >
                                ×
                              </text> */}
                            </>
                          ) : (
                            <>
                              {/* <rect
                                x={xRect + detection.width - 18}
                                y={yRect - 18}
                                width={18}
                                height={18}
                                rx={3}
                                ry={3}
                                fill="#ef4444"
                                opacity="0.9"
                                style={{ pointerEvents: "auto" }}
                                onClick={(e) => { e.stopPropagation(); deleteUserAnnotation(detection.id); }}
                              />
                              <text
                                x={xRect + detection.width - 9}
                                y={yRect - 5}
                                textAnchor="middle"
                                fontSize="12"
                                fontFamily="Arial, sans-serif"
                                fill="#ffffff"
                                style={{ pointerEvents: "none" }}
                              >
                                ×
                              </text> */}
                            </>
                          )}
                        </g>
                      )}

                      {hasConfidence && (
                        <text
                          x={userPolygonCentroid?.x ?? labelX}
                          y={userPolygonCentroid?.y ?? labelY}
                          dy={userPolygonCentroid ? -10 : 0}
                          fill="#0f172a"
                          fontSize="10"
                          fontWeight="700"
                          textAnchor="start"
                          style={{ paintOrder: "stroke", stroke: "rgba(255,255,255,0.95)", strokeWidth: 2 }}
                        >
                          {/* {`${Math.round(detection.confidence * 100)}%`} */}
                        </text>
                      )}

                    </g>
                  );
                })}


              {measurements.map((measurement) => {
                const midX = (measurement.start.x + measurement.end.x) / 2;
                const midY = (measurement.start.y + measurement.end.y) / 2;
                return (
                  <g key={measurement.id} style={{ pointerEvents: 'none' }}>
                    <line
                      x1={measurement.start.x}
                      y1={measurement.start.y}
                      x2={measurement.end.x}
                      y2={measurement.end.y}
                      stroke={measurementColor}
                      strokeWidth={2.8}
                      strokeOpacity={0.95}
                    />
                    <circle
                      cx={measurement.start.x}
                      cy={measurement.start.y}
                      r={4.2}
                      fill="#0f172a"
                      stroke={measurementColor}
                      strokeWidth={2}
                    />
                    <circle
                      cx={measurement.end.x}
                      cy={measurement.end.y}
                      r={4.2}
                      fill="#0f172a"
                      stroke={measurementColor}
                      strokeWidth={2}
                    />
                    <text
                      x={midX}
                      y={midY - 6}
                      fill="#f8fafc"
                      fontSize={13}
                      fontWeight="bold"
                      textAnchor="middle"
                      style={{ paintOrder: 'stroke', stroke: 'rgba(15,23,42,0.9)', strokeWidth: 4 }}
                    >
                      {measurement.label}
                    </text>
                    {!measurement.hasCalibration && (
                      <text
                        x={midX}
                        y={midY + 10}
                        fill="rgba(148,163,184,0.8)"
                        fontSize={10}
                        textAnchor="middle"
                      >
                        Calibration pending
                      </text>
                    )}
                  </g>
                );
              })}

              {isMeasuring && measurementDraft && (() => {
                const dx = measurementDraft.end.x - measurementDraft.start.x;
                const dy = measurementDraft.end.y - measurementDraft.start.y;
                const lengthPx = Math.sqrt(dx * dx + dy * dy);
                const conversion = convertPixelDistance(lengthPx);
                const midX = (measurementDraft.start.x + measurementDraft.end.x) / 2;
                const midY = (measurementDraft.start.y + measurementDraft.end.y) / 2;
                return (
                  <g style={{ pointerEvents: 'none' }}>
                    <line
                      x1={measurementDraft.start.x}
                      y1={measurementDraft.start.y}
                      x2={measurementDraft.end.x}
                      y2={measurementDraft.end.y}
                      stroke={measurementDraftColor}
                      strokeWidth={2}
                      strokeDasharray="6 4"
                      strokeOpacity={0.9}
                    />
                    <circle
                      cx={measurementDraft.start.x}
                      cy={measurementDraft.start.y}
                      r={3.8}
                      fill="white"
                      stroke={measurementDraftColor}
                      strokeWidth={2}
                    />
                    <circle
                      cx={measurementDraft.end.x}
                      cy={measurementDraft.end.y}
                      r={3.8}
                      fill="white"
                      stroke={measurementDraftColor}
                      strokeWidth={2}
                    />
                    <text
                      x={midX}
                      y={midY - 6}
                      fill="#1e293b"
                      fontSize={12}
                      fontWeight="bold"
                      textAnchor="middle"
                      style={{ paintOrder: 'stroke', stroke: 'rgba(255,255,255,0.85)', strokeWidth: 4 }}
                    >
                      {conversion.formatted}
                    </text>
                  </g>
                );
              })()}

              {/* Current drawing box */}
              {currentBox && isDrawing && (
                <g>
                  <rect
                    x={currentBox.x}
                    y={currentBox.y}
                    width={currentBox.width}
                    height={currentBox.height}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeDasharray="5,5"
                    strokeOpacity="0.8"
                  />
                  <rect
                    x={currentBox.x}
                    y={currentBox.y}
                    width={currentBox.width}
                    height={currentBox.height}
                    fill="#3b82f6"
                    fillOpacity="0.1"
                  />
                </g>
              )}

              {/* Polygon in-progress drawing */}
              {polygonPoints.length > 0 && (() => {
                const liveAreaPx = computePolygonArea(polygonPoints);
                const liveInfo = convertPixelArea(liveAreaPx);
                const liveCentroid = computePolygonCentroid(polygonPoints);
                return (
                  <g>
                    {/* Semi-transparent fill */}
                    <polygon
                      points={polygonPoints.map((p) => `${p.x},${p.y}`).join(" ")}
                      fill="#60a5fa"
                      fillOpacity={0.2}
                      stroke="#60a5fa"
                      strokeWidth={2}
                      strokeOpacity={0.9}
                    />
                    {/* Corner point handles - larger circles with white fill and colored border */}
                    {polygonPoints.map((p, idx) => (
                      <g key={idx}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={8}
                          fill="white"
                          stroke="#60a5fa"
                          strokeWidth={3}
                          style={{ cursor: 'move' }}
                        />
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={3}
                          fill="#60a5fa"
                        />
                      </g>
                    ))}
                    {polygonPoints.length > 2 && (
                      <text
                        x={liveCentroid.x}
                        y={liveCentroid.y}
                        fill="#0f172a"
                        fontSize={13}
                        fontWeight="bold"
                        textAnchor="middle"
                        style={{ paintOrder: 'stroke', stroke: 'rgba(248,250,252,0.85)', strokeWidth: 4 }}
                      >
                        {liveInfo.formatted}
                      </text>
                    )}
                  </g>
                );
              })()}

              {/* Debug: Show if we're in drawing mode */}
              {isDrawing && (
                <text x="50" y="50" fill="red" fontSize="20" fontWeight="bold">
                  DRAWING MODE
                </text>
              )}
            </svg>
          )}
        </div>
      </div>

      {shapeTooltip && showDimensions && (
        <div
          className="pointer-events-none absolute z-[55] flex min-w-[160px] max-w-[200px] flex-col gap-2 rounded-xl border border-white/60 bg-slate-900/90 px-3 py-2 text-white shadow-2xl backdrop-blur"
          style={{
            left: Math.max(
              12,
              Math.min(
                shapeTooltip.x + 18,
                (containerRef.current?.clientWidth ?? 0) - 200
              )
            ),
            top: Math.max(
              12,
              Math.min(
                shapeTooltip.y + 18,
                (containerRef.current?.clientHeight ?? 0) - 120
              )
            ),
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="inline-flex h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: shapeTooltip.color }}
            />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
              {shapeTooltip.name}
            </span>
          </div>
          {shapeTooltip.area ? (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-200">Area</span>
              <span className="font-bold" style={{ color: shapeTooltip.color }}>
                {shapeTooltip.area}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400">Area unavailable</span>
          )}
          <span className="text-[10px] uppercase tracking-wide text-slate-500">
            Hover for live values
          </span>
        </div>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex space-x-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                  ? "bg-white"
                  : "bg-white bg-opacity-50 hover:bg-opacity-75"
                  }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.visible && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]">
          <div className="flex items-center gap-3 bg-black text-white px-4 py-2 rounded shadow-lg">
            <span className="text-sm">{snackbar.message}</span>
            <button
              className="text-green-400 hover:text-green-300 font-semibold text-sm"
              onClick={undoLast}
            >
              Undo
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {/* <div className="absolute bottom-4 left-4 z-10 text-white text-sm bg-black bg-opacity-50 rounded-lg p-3 max-w-xs">
        <p className="text-xs text-gray-300 space-y-1">
          <span className="block">Use arrow keys or buttons to navigate</span>
          <span className="block">
            +/- to zoom • R to rotate • Esc to close
          </span>
          {zoom > 1 && <span className="block">Drag to pan when zoomed</span>}
          {activeTool === "annotate" && (
            <span className="block text-blue-300 font-medium">
              🎯 Annotation Mode: Click and drag to create bounding boxes
            </span>
          )}
        </p>
      </div> */}

      {/* Detection Results Panel (collapsible sidebar) */}
      {detectionResults && sidebarOpen && (
        <div className="absolute w-96 top-16 right-0 z-10 bg-white bg-opacity-95 text-black rounded-lg py-4 px-5 max-w-sm h-screen overflow-y-auto shadow-2xl border border-gray-300">
          {/* <div className="flex items-center justify-between mb-4 pt-6">
            <h4 className="text-xl font-bold text-gray-800">
              Detection Results
            </h4>
            <button
              onClick={() => setSidebarOpen(false)}
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <button
                onClick={() => setShowAddClassModal(true)}
                className="w-1/4 flex items-center justify-center gap-2 mb-4 px-2 py-2  mt-3
                bg-black text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
              >
                +
              </button>
            </div>
          </div>

          {/* Add New Class Button */}

          {/* Class Breakdown */}
          {detectionResults.predictions &&
            detectionResults.predictions.length > 0 && (
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
                  {Object.entries(getFilteredClasses()).map(
                    ([className, stats]) => {
                      const isSelected = selectedClasses.has(className);
                      const classColor = getColorForClass(className);
                      const count = stats.count;
                      const avgConfidence =
                        typeof stats.avgConfidence === "number"
                          ? Math.round(stats.avgConfidence * 100)
                          : null;

                      return (
                        <button
                          key={className}
                          onClick={() => toggleClassSelection(className)}
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
                            {/* <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                              <span>
                                {avgConfidence !== null
                                  ? `Avg conf ${avgConfidence}%`
                                  : "No AI confidence"}
                              </span>
                              {detectionTimestamp && (
                                <>
                                  <span className="inline-block h-1 w-1 rounded-full bg-gray-300" />
                                  <span>{detectionTimestamp.timeLabel}</span>
                                </>
                              )}
                            </div> */}
                            {/* {stats.confidences.length > 0 && (
                              (() => {
                                const preview = stats.confidences
                                  .slice(0, 4)
                                  .map((cnf) => `${Math.round(cnf * 100)}%`);
                                const remaining = Math.max(stats.confidences.length - preview.length, 0);
                                const tooltip = stats.confidences
                                  .map((cnf) => `${Math.round(cnf * 100)}%`)
                                  .join(", ");
                                return (
                                  <p
                                    className="mt-1 text-[11px] text-gray-500"
                                    title={tooltip}
                                  >
                                    <span className="font-semibold text-gray-600">
                                      Confidence:
                                    </span>{" "}
                                    <span className="text-gray-500">
                                      {preview.join(", ")}
                                      {remaining > 0 && ` +${remaining} more`}
                                    </span>
                                  </p>
                                );
                              })()
                            )} */}
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
                    }
                  )}
                </div>

                {/* Clear Filter Button */}
                {selectedClasses.size > 0 && (
                  <button
                    onClick={() => setSelectedClasses(new Set())}
                    className="mt-3 w-full text-sm text-gray-600 hover:text-blue-600 underline py-1"
                  >
                    Clear filter (show all{" "}
                    {Object.keys(getClassCounts()).length} classes)
                  </button>
                )}

                {/* Summary Stats */}
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">
                    Total Detections:
                  </p>
                  <p className="text-lg font-bold text-gray-800">
                    {detectionResults.predictions.length}
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    {Object.keys(getClassCounts()).length} different classes
                    detected
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
                        style={{ maxHeight: '200px', objectFit: 'contain' }}
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
      )}

      <AskAISidePanel
        open={askAiOpen}
        onClose={() => setAskAiOpen(false)}
        imageName={currentImage.name}
        detectionContext={detectionContext}
      />

      {/* Class Selector Modal for Annotations */}
      {showClassSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 w-96 w-md mx-4 max-h-[70vh] overflow-y-auto">
            {/* Create New Class */}
            <div className="">
              <h4 className="text-md font-semibold text-gray-900  mb-2">
                Create New Class
              </h4>
              <input
                type="text"
                placeholder="Enter new class name..."
                value={selectedAnnotationClass}
                onChange={(e) => setSelectedAnnotationClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                onKeyPress={(e) =>
                  e.key === "Enter" && handleCreateNewClassForAnnotation()
                }
              />
              <div className="flex gap-3">
                <button
                  onClick={handleCreateNewClassForAnnotation}
                  disabled={!selectedAnnotationClass.trim()}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg
                   hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed 
                   transition-colors text-sm"
                >
                  Create & Assign
                </button>
                <button
                  onClick={() => {
                    setShowClassSelector(false);
                    setPendingAnnotation(null);
                    setSelectedAnnotationClass("");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-800 text-gray-100 rounded-lg
                   hover:bg-gray-300 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Existing Classes */}
            <div className="my-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Existing Classes:
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {getAllAvailableClasses().map((className) => (
                  <button
                    key={className}
                    onClick={() => handleAssignClass(className)}
                    className="w-full flex items-center gap-3 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getColorForClass(className) }}
                    ></div>
                    <span className="capitalize text-sm">{className}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Class Modal */}
      {showAddClassModal && (
        <div className="fixed inset-0 bg-black/50 bg-blur-sm bg-opacity-50 flex items-center justify-center 0 z-60">
          <div className="bg-white rounded-lg p-6 w-96 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Class</h3>
            <input
              type="text"
              placeholder="Enter class name..."
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              onKeyPress={(e) => e.key === "Enter" && handleAddNewClass()}
            />
            <div className="flex gap-3">
              <button
                onClick={handleAddNewClass}
                disabled={!newClassName.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Add Class
              </button>
              <button
                onClick={() => {
                  setShowAddClassModal(false);
                  setNewClassName("");
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Sidebar Button (when closed) */}
      {!sidebarOpen && detectionResults && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute top-24 right-4 z-10 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          title="Show Detection Panel"
        >
          <Search className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
