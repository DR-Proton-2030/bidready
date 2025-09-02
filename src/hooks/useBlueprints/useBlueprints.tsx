/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import {
  BLUEPRINTS_DATA,
  BLUEPRINTS_TEXT,
} from "@/constants/blueprints/blueprints.constant";
import { BluePrint } from "@/@types/interface/blueprint.interface";

type UseBlueprintsOptions = {
  initialData?: BluePrint[];
};

export const useBlueprints = ({ initialData }: UseBlueprintsOptions = {}) => {
  const [activeCategory, setActiveCategory] = useState<string>(
    BLUEPRINTS_TEXT.allCategory
  );

  const source = initialData;

  const filteredBlueprints = useMemo(() => {
    if (!source) return [];
    return activeCategory === BLUEPRINTS_TEXT.allCategory
      ? source
      : source.filter((blueprint) => blueprint.type === activeCategory);
  }, [activeCategory, source]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleDownload = (id: number) => {
    // This could be enhanced to actually handle download logic
    console.log(`Downloading blueprint with id: ${id}`);
    // You can add actual download logic here
  };

  const handleNewBlueprint = async (payload: any) => {
    try {
      const result = await createBlueprintServer(payload);
      return result;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create blueprint";
      throw new Error(message);
    }
  };

  const createBlueprintServer = async (payload: any) => {
    try {
      // Accept either FormData (from the form) or a plain object
      let body: FormData;
      if (payload instanceof FormData) {
        body = payload;
      } else {
        body = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value === undefined || value === null) return;
          // If value is File or Blob, append directly
          if (value instanceof File || value instanceof Blob) {
            body.append(key, value as File);
          } else if (Array.isArray(value)) {
            value.forEach((v) => body.append(key, String(v)));
          } else if (typeof value === "object") {
            body.append(key, JSON.stringify(value));
          } else {
            body.append(key, String(value));
          }
        });
      }

      const res = await fetch("/api/blueprints", {
        method: "POST",
        // DO NOT set Content-Type: browser will set multipart/form-data boundary
        body,
      });

      if (!res.ok) {
        // Try to parse error JSON
        let errBody: any = { message: "Failed to create blueprint" };
        try {
          errBody = await res.json();
        } catch {}
        throw new Error(errBody.message || "Failed to create blueprint");
      }
      // Try to parse JSON response
      try {
        return await res.json();
      } catch {
        return null;
      }
    } catch (err) {
      throw err;
    }
  };

  return {
    activeCategory,
    filteredBlueprints,
    handleCategoryChange,
    handleDownload,
    handleNewBlueprint,
    createBlueprintServer,
  };
};
