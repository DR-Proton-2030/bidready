"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import ImageCard from "@/components/pages/bluePrintDeatils/dashboard/ImageCard";

interface BulkBlueprintDetectionOverlayProps {
  blueprintId: string;
  onDone: () => void;
}

export default function BulkBlueprintDetectionOverlay({
  blueprintId,
  onDone,
}: BulkBlueprintDetectionOverlayProps) {
  const [images, setImages] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const BASE =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_BLUEPRINTS_API_URL ||
      "http://localhost:8989/api/v1";
    const token =
      typeof window !== "undefined" ? localStorage.getItem("@token") : null;

    fetch(`${BASE}/blueprints/get-blueprint-details/${blueprintId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load blueprint images");
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        setImages(json?.data?.blueprint_images || []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load blueprint images");
      });

    return () => {
      cancelled = true;
    };
  }, [blueprintId]);

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50">
        <div className="bg-white rounded-xl p-6 text-center shadow-xl">
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button
            type="button"
            onClick={onDone}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!images) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <ImageCard
      blueprint_images={images}
      maxFiles={images.length || 5}
      autoOpen
      onClose={onDone}
    />
  );
}
