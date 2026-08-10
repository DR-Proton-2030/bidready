import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { createCanvas, loadImage } from "canvas";

export const runtime = "nodejs";
export const maxDuration = 300;

type BlueprintRegionDetection = {
  label: string;
  box: [number, number, number, number];
};

const defaultQuery = "rooms, corridors";

// Gemini's vision encoder downsamples large images, so a single pass over a
// full-sheet blueprint loses the wall detail we need for accurate boxes.
// Cropping into overlapping tiles keeps each region near native resolution.
const TARGET_TILE_PX = 1100;
const MAX_TILES = 9;
const TILE_OVERLAP = 0.12;
const TILE_CONCURRENCY = 4;

// A single room/corridor never covers a large share of the sheet; anything
// bigger is a mis-detection that swallowed the whole plan.
const MAX_AREA_FRACTION = 0.25;
const MIN_AREA_FRACTION = 0.00005;
const DEDUPE_IOU = 0.45;
const CONTAINMENT_RATIO = 0.7;
// A long corridor crossing several tiles comes back as aligned fragments that
// overlap in the tile seams. Rejoin them so the area isn't counted twice.
const ALIGN_TOLERANCE = 15;
const MIN_MERGE_OVERLAP = 0.2;

type Rect = { x0: number; y0: number; x1: number; y1: number };

const buildImagePayload = (imageDataUrl: string) => {
  const parts = imageDataUrl.split(",");
  if (parts.length < 2) {
    throw new Error("Invalid image data URL.");
  }

  const mimeType = imageDataUrl.match(/data:(.*?);/)?.[1] || "image/jpeg";
  return { mimeType, data: parts[1] };
};

const buildPrompt = (query: string, tiled: boolean) => `Analyze this ${
  tiled ? "crop of a floor plan/blueprint" : "floor plan/blueprint"
} and exhaustively detect ALL instances of the following elements: ${query}.

CRITICAL INSTRUCTIONS FOR BOUNDING BOXES:
1. EXHAUSTIVE DETECTION: You must find and bound EVERY SINGLE instance of the requested elements. Do not skip any rooms.
2. ZERO OVERLAP: Rooms and corridors are distinct physical spaces. A room's bounding box MUST NOT overlap with a corridor's bounding box. Stop the room's box exactly at the wall or door line that separates it from the corridor.
3. WALL-TO-WALL SNAPPING: Use the solid lines (walls) as your absolute boundaries. The box must span exactly from the inner edge of one wall to the inner edge of the opposite wall. Trace the wall lines; do not estimate.
4. INDIVIDUAL SPACES: Each distinct room (e.g., each individual hotel suite, studio, stairwell, elevator lobby, or storage room) must have its own separate bounding box. Do not group multiple rooms into one box.
5. FULL ENCLOSURE: The box must cover the entire floor space of that specific room, not just the text label.
6. NO DRAWING FURNITURE: Ignore the title block, legends, dimension strings, section markers and notes. Only bound actual enclosed floor spaces.
7. PRECISION: Coordinates must be highly accurate, normalized to 0-1000 (ymin, xmin, ymax, xmax) relative to THIS image.${
  tiled
    ? "\n8. PARTIAL SPACES: This is a crop of a larger sheet. If a space is cut off by the edge of this crop, still bound the visible portion and let it touch the edge."
    : ""
}

Return a JSON array of objects. Each object must have:
- "label": string (the name of the detected object, e.g., "rooms", "corridors")
- "box": [ymin, xmin, ymax, xmax] (bounding box coordinates normalized to 0-1000, where ymin is top, xmin is left, ymax is bottom, xmax is right)

Only return the JSON array, nothing else.`;

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      label: { type: Type.STRING },
      box: {
        type: Type.ARRAY,
        items: { type: Type.NUMBER },
        description: "[ymin, xmin, ymax, xmax] normalized to 0-1000",
      },
    },
    required: ["label", "box"],
  },
};

const toRect = (box: [number, number, number, number]): Rect => {
  const [ymin, xmin, ymax, xmax] = box;
  return {
    x0: Math.min(xmin, xmax),
    y0: Math.min(ymin, ymax),
    x1: Math.max(xmin, xmax),
    y1: Math.max(ymin, ymax),
  };
};

const rectArea = (r: Rect) => Math.max(0, r.x1 - r.x0) * Math.max(0, r.y1 - r.y0);

const intersectionArea = (a: Rect, b: Rect) => {
  const w = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
  const h = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
  if (w <= 0 || h <= 0) return 0;
  return w * h;
};

const iou = (a: Rect, b: Rect) => {
  const inter = intersectionArea(a, b);
  if (!inter) return 0;
  return inter / (rectArea(a) + rectArea(b) - inter);
};

const normalizeLabel = (label: string) => {
  const cls = String(label || "").trim().toLowerCase();
  if (cls.startsWith("corridor") || cls === "hallway" || cls === "hall") {
    return "corridors";
  }
  return "rooms";
};

/**
 * Runs the model over one image (full sheet or a single tile) and returns the
 * raw detections in that image's own 0-1000 space.
 */
const detectOnImage = async (
  ai: GoogleGenAI,
  imageDataUrl: string,
  query: string,
  tiled: boolean,
): Promise<BlueprintRegionDetection[]> => {
  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      { inlineData: buildImagePayload(imageDataUrl) },
      { text: buildPrompt(query, tiled) },
    ],
    config: {
      // Detection should be deterministic; sampling only adds coordinate jitter.
      temperature: 0,
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  const text = result.text;
  if (!text) return [];

  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (d: any) => d && Array.isArray(d.box) && d.box.length === 4,
    );
  } catch {
    return [];
  }
};

/**
 * Splits the sheet into overlapping tiles sized so each one reaches the model
 * at roughly native resolution. Returns a single full-image tile when the
 * sheet is already small enough.
 */
const buildTiles = (width: number, height: number) => {
  let cols = Math.max(1, Math.round(width / TARGET_TILE_PX));
  let rows = Math.max(1, Math.round(height / TARGET_TILE_PX));

  while (cols * rows > MAX_TILES) {
    if (cols >= rows) cols -= 1;
    else rows -= 1;
  }

  const tileW = width / cols;
  const tileH = height / rows;
  const padX = tileW * TILE_OVERLAP;
  const padY = tileH * TILE_OVERLAP;

  const tiles: Rect[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      tiles.push({
        x0: Math.max(0, c * tileW - padX),
        y0: Math.max(0, r * tileH - padY),
        x1: Math.min(width, (c + 1) * tileW + padX),
        y1: Math.min(height, (r + 1) * tileH + padY),
      });
    }
  }
  return tiles;
};

const runWithConcurrency = async <T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> => {
  const results = new Array<R>(items.length);
  let cursor = 0;

  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  });

  await Promise.all(runners);
  return results;
};

type LabelledRect = { label: string; rect: Rect };

/**
 * Rejoins pieces of one space that different tiles each saw part of. Two boxes
 * merge only when they share an edge line on one axis and genuinely overlap on
 * the other - enough overlap that they cannot be two neighbouring spaces whose
 * boxes just bled into each other by a pixel or two.
 */
const joinAlignedFragments = (items: LabelledRect[]): LabelledRect[] => {
  const out = [...items];

  let merged = true;
  while (merged) {
    merged = false;

    for (let i = 0; i < out.length && !merged; i++) {
      for (let j = i + 1; j < out.length; j++) {
        const a = out[i];
        const b = out[j];
        if (a.label !== b.label) continue;
        if (!intersectionArea(a.rect, b.rect)) continue;

        const sameRows =
          Math.abs(a.rect.y0 - b.rect.y0) <= ALIGN_TOLERANCE &&
          Math.abs(a.rect.y1 - b.rect.y1) <= ALIGN_TOLERANCE;
        const sameCols =
          Math.abs(a.rect.x0 - b.rect.x0) <= ALIGN_TOLERANCE &&
          Math.abs(a.rect.x1 - b.rect.x1) <= ALIGN_TOLERANCE;
        if (!sameRows && !sameCols) continue;

        // Overlap measured along the axis the two fragments extend on.
        const overlap = sameRows
          ? Math.min(a.rect.x1, b.rect.x1) - Math.max(a.rect.x0, b.rect.x0)
          : Math.min(a.rect.y1, b.rect.y1) - Math.max(a.rect.y0, b.rect.y0);
        const smallestSpan = sameRows
          ? Math.min(a.rect.x1 - a.rect.x0, b.rect.x1 - b.rect.x0)
          : Math.min(a.rect.y1 - a.rect.y0, b.rect.y1 - b.rect.y0);
        if (overlap < smallestSpan * MIN_MERGE_OVERLAP) continue;

        const union: Rect = {
          x0: Math.min(a.rect.x0, b.rect.x0),
          y0: Math.min(a.rect.y0, b.rect.y0),
          x1: Math.max(a.rect.x1, b.rect.x1),
          y1: Math.max(a.rect.y1, b.rect.y1),
        };
        if (rectArea(union) / 1_000_000 > MAX_AREA_FRACTION) continue;

        out[i] = { label: a.label, rect: union };
        out.splice(j, 1);
        merged = true;
        break;
      }
    }
  }

  return out;
};

/**
 * Drops degenerate/oversized boxes, then removes duplicates produced by the
 * tile overlap. Larger boxes win, since a room seen whole in one tile should
 * beat the sliver of it that leaked into the neighbouring tile.
 */
const mergeDetections = (
  detections: BlueprintRegionDetection[],
): BlueprintRegionDetection[] => {
  const cleaned = detections
    .map((det) => {
      const r = toRect(det.box);
      return {
        label: normalizeLabel(det.label),
        rect: {
          x0: Math.max(0, Math.min(1000, r.x0)),
          y0: Math.max(0, Math.min(1000, r.y0)),
          x1: Math.max(0, Math.min(1000, r.x1)),
          y1: Math.max(0, Math.min(1000, r.y1)),
        },
      };
    })
    .filter(({ rect }) => {
      const areaFraction = rectArea(rect) / 1_000_000;
      return (
        areaFraction >= MIN_AREA_FRACTION && areaFraction <= MAX_AREA_FRACTION
      );
    })
    .sort((a, b) => rectArea(b.rect) - rectArea(a.rect));

  const kept: typeof cleaned = [];
  for (const candidate of cleaned) {
    const duplicate = kept.some((existing) => {
      if (existing.label !== candidate.label) return false;
      if (iou(existing.rect, candidate.rect) > DEDUPE_IOU) return true;
      // A tile-clipped sliver sits almost entirely inside the full box.
      const inter = intersectionArea(existing.rect, candidate.rect);
      return inter / Math.max(1, rectArea(candidate.rect)) > CONTAINMENT_RATIO;
    });
    if (!duplicate) kept.push(candidate);
  }

  const joined = joinAlignedFragments(kept);

  // A room that is mostly inside a corridor is a mis-label, not a room.
  const corridors = joined.filter((d) => d.label === "corridors");
  const final = joined.filter((d) => {
    if (d.label !== "rooms") return true;
    return !corridors.some(
      (c) =>
        intersectionArea(c.rect, d.rect) / Math.max(1, rectArea(d.rect)) > 0.6,
    );
  });

  return final.map(({ label, rect }) => ({
    label,
    box: [
      Number(rect.y0.toFixed(2)),
      Number(rect.x0.toFixed(2)),
      Number(rect.y1.toFixed(2)),
      Number(rect.x1.toFixed(2)),
    ] as [number, number, number, number],
  }));
};

export async function POST(request: Request) {
  try {
    const { imageDataUrl, detectionQuery, tiled } = (await request.json()) as {
      imageDataUrl?: string;
      detectionQuery?: string;
      tiled?: boolean;
    };

    if (!imageDataUrl) {
      return NextResponse.json(
        { error: "Missing imageDataUrl." },
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY on server." },
        { status: 500 },
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const query = detectionQuery?.trim() || defaultQuery;

    let image: Awaited<ReturnType<typeof loadImage>> | null = null;
    if (tiled !== false) {
      try {
        image = await loadImage(imageDataUrl);
      } catch (e) {
        // Fall back to the single-pass path if the sheet can't be decoded.
        console.warn("Tiling unavailable, falling back to single pass:", e);
      }
    }

    const tiles =
      image && image.width && image.height
        ? buildTiles(image.width, image.height)
        : [];

    if (!image || tiles.length <= 1) {
      const parsed = await detectOnImage(ai, imageDataUrl, query, false);
      return NextResponse.json(mergeDetections(parsed));
    }

    const imageWidth = image.width;
    const imageHeight = image.height;

    const perTile = await runWithConcurrency(
      tiles,
      TILE_CONCURRENCY,
      async (tile) => {
        const tileW = Math.round(tile.x1 - tile.x0);
        const tileH = Math.round(tile.y1 - tile.y0);
        if (tileW <= 0 || tileH <= 0) return [];

        const canvas = createCanvas(tileW, tileH);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(
          image as any,
          tile.x0,
          tile.y0,
          tileW,
          tileH,
          0,
          0,
          tileW,
          tileH,
        );
        const tileDataUrl = canvas.toDataURL("image/jpeg", 0.92);

        let detections: BlueprintRegionDetection[] = [];
        try {
          detections = await detectOnImage(ai, tileDataUrl, query, true);
        } catch (e) {
          console.error("Tile detection failed:", e);
          return [];
        }

        // Map tile-local 0-1000 coordinates back into full-sheet 0-1000 space.
        return detections.map((det) => {
          const r = toRect(det.box);
          const gx0 = ((tile.x0 + (r.x0 / 1000) * tileW) / imageWidth) * 1000;
          const gx1 = ((tile.x0 + (r.x1 / 1000) * tileW) / imageWidth) * 1000;
          const gy0 = ((tile.y0 + (r.y0 / 1000) * tileH) / imageHeight) * 1000;
          const gy1 = ((tile.y0 + (r.y1 / 1000) * tileH) / imageHeight) * 1000;
          return {
            label: det.label,
            box: [gy0, gx0, gy1, gx1] as [number, number, number, number],
          };
        });
      },
    );

    const merged = mergeDetections(perTile.flat());

    if (!merged.length) {
      // Every tile came back empty - retry once over the whole sheet so the
      // caller isn't left with nothing.
      const parsed = await detectOnImage(ai, imageDataUrl, query, false);
      return NextResponse.json(mergeDetections(parsed));
    }

    return NextResponse.json(merged);
  } catch (error) {
    console.error("Gemini detection error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Detection failed." },
      { status: 500 },
    );
  }
}
