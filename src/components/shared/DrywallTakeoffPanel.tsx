import React, { useMemo, useState } from "react";
import { ChevronDown, Layers, Info } from "lucide-react";

/**
 * Geometry the viewer computes from wall detections + calibration. Lengths are
 * already converted to real-world units (feet) when calibration is available;
 * otherwise they fall back to pixels and `hasCalibration` is false.
 */
export interface DrywallGeometry {
  hasCalibration: boolean;
  unit: string; // "ft" when calibrated, otherwise "px"
  wallLength: number; // total merged wall run in `unit`
  wallCount: number; // number of wall detections used
  doorCount: number;
  windowCount: number;
  doorOpeningWidth: number; // summed door opening widths in `unit`
  windowOpeningWidth: number; // summed window opening widths in `unit`
}

/** User-tunable takeoff assumptions; persisted so they survive a reload. */
export interface DrywallSettings {
  wallHeight: number;
  sides: 1 | 2;
  deductOpenings: boolean;
  sheetSize: number;
}

export const DEFAULT_DRYWALL_SETTINGS: DrywallSettings = {
  wallHeight: 9,
  sides: 2,
  deductOpenings: true,
  sheetSize: 32,
};

interface DrywallTakeoffPanelProps {
  geometry: DrywallGeometry;
  settings: DrywallSettings;
  onSettingsChange: (patch: Partial<DrywallSettings>) => void;
}

// Standard opening heights (ft) used for area deductions. Doors are typically
// 6'-8"; windows vary, so 4' is a conservative default for a punched opening.
const DOOR_HEIGHT_FT = 6.83;
const WINDOW_HEIGHT_FT = 4;

const SHEET_OPTIONS = [
  { label: "4×8 (32 SF)", value: 32 },
  { label: "4×10 (40 SF)", value: 40 },
  { label: "4×12 (48 SF)", value: 48 },
];

const fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const fmt0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export const DrywallTakeoffPanel: React.FC<DrywallTakeoffPanelProps> = ({
  geometry,
  settings,
  onSettingsChange,
}) => {
  const [open, setOpen] = useState(true);
  const { wallHeight, sides, deductOpenings, sheetSize } = settings;

  const {
    hasCalibration,
    unit,
    wallLength,
    wallCount,
    doorCount,
    windowCount,
    doorOpeningWidth,
    windowOpeningWidth,
  } = geometry;

  const result = useMemo(() => {
    // Gross wall surface = run × height × faces
    const gross = wallLength * wallHeight * sides;

    // Opening deductions: opening width × standard height × faces
    const doorArea = doorOpeningWidth * DOOR_HEIGHT_FT * sides;
    const windowArea = windowOpeningWidth * WINDOW_HEIGHT_FT * sides;
    const openings = deductOpenings ? doorArea + windowArea : 0;

    const net = Math.max(0, gross - openings);
    const sheets = sheetSize > 0 ? Math.ceil(net / sheetSize) : 0;

    return { gross, openings, net, sheets };
  }, [
    wallLength,
    wallHeight,
    sides,
    doorOpeningWidth,
    windowOpeningWidth,
    deductOpenings,
    sheetSize,
  ]);

  const areaUnit = hasCalibration ? "ft²" : "px²";

  return (
    <div className="bg-white/70 border border-white/60 rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/60 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-gray-800">
          <Layers className="h-4 w-4 text-red-500" />
          Drywall Takeoff
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="px-3 pb-3 flex flex-col gap-3">
          {!hasCalibration && (
            <div className="flex items-start gap-1.5 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
              <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>
                Not calibrated — figures are in pixels. Run Calibration to get
                real linear/square feet.
              </span>
            </div>
          )}

          {/* Wall run */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">
              Wall run ({wallCount} walls)
            </span>
            <span className="font-bold text-gray-800">
              {fmt.format(wallLength)} {hasCalibration ? "LF" : unit}
            </span>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Wall height (ft)
              </span>
              <input
                type="number"
                min={1}
                step={0.5}
                value={wallHeight}
                onChange={(e) =>
                  onSettingsChange({
                    wallHeight: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Faces
              </span>
              <div className="flex bg-white border border-gray-200 rounded-lg p-0.5">
                {([1, 2] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => onSettingsChange({ sides: s })}
                    className={`flex-1 text-xs font-semibold py-1 rounded-md transition-all ${
                      sides === s
                        ? "bg-red-500 text-white shadow-sm"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {s === 1 ? "1 side" : "2 sides"}
                  </button>
                ))}
              </div>
            </label>
          </div>

          {/* Sheet size */}
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Sheet size
            </span>
            <select
              value={sheetSize}
              onChange={(e) =>
                onSettingsChange({ sheetSize: Number(e.target.value) })
              }
              className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
            >
              {SHEET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          {/* Deduct openings */}
          <label className="flex items-center justify-between text-xs cursor-pointer">
            <span className="text-gray-600 font-medium">
              Deduct openings ({doorCount}D / {windowCount}W)
            </span>
            <button
              onClick={() => onSettingsChange({ deductOpenings: !deductOpenings })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                deductOpenings ? "bg-red-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  deductOpenings ? "translate-x-4" : ""
                }`}
              />
            </button>
          </label>

          {/* Results */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-200/60">
            <Row label="Gross area" value={`${fmt.format(result.gross)} ${areaUnit}`} />
            {deductOpenings && (
              <Row
                label="Openings"
                value={`− ${fmt.format(result.openings)} ${areaUnit}`}
                muted
              />
            )}
            <Row
              label="Net drywall"
              value={`${fmt.format(result.net)} ${areaUnit}`}
              strong
            />
            {hasCalibration && (
              <div className="flex items-center justify-between mt-1 bg-red-50 border border-red-100 rounded-lg px-2.5 py-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                  Sheets needed
                </span>
                <span className="text-lg font-extrabold text-red-600 leading-none">
                  {fmt0.format(result.sheets)}
                </span>
              </div>
            )}
          </div>

          {deductOpenings && (
            <p className="text-[9px] text-gray-400 leading-tight">
              Openings assume {DOOR_HEIGHT_FT}&apos; door / {WINDOW_HEIGHT_FT}
              &apos; window height. Verify against the door &amp; window schedule.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const Row: React.FC<{
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}> = ({ label, value, strong, muted }) => (
  <div className="flex items-center justify-between text-xs">
    <span className={muted ? "text-gray-400" : "text-gray-600 font-medium"}>
      {label}
    </span>
    <span
      className={
        strong
          ? "text-sm font-extrabold text-gray-900"
          : muted
            ? "text-gray-400 font-semibold"
            : "font-bold text-gray-800"
      }
    >
      {value}
    </span>
  </div>
);

export default DrywallTakeoffPanel;
