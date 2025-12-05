import React from "react";
import { Sparkles } from "lucide-react";
import { DetectionPreview } from "./types";

export interface DetectionSnapshotProps {
    preview: DetectionPreview | null;
}

export default function DetectionSnapshot({ preview }: DetectionSnapshotProps) {
    if (!preview) return null;

    const metricTiles = [
        { label: "Detections", value: preview.totalPredictions },
        { label: "Annotations", value: preview.totalUserAnnotations },
        { label: "Measurements", value: preview.totalMeasurements },
    ];

    return (
        <section data-aos="fade-up" data-aos-duration="1200" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200 mt-2">
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase  text-slate-700">Detection Snapshot</p>
                <Sparkles className="h-4 w-4 text-orange-500" />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                {metricTiles.map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-slate-100 bg-slate-100 p-3 text-center">
                        <p className="text-[11px] uppercase  text-slate-800">{stat.label}</p>
                        <p className="mt-1 text-2xl font-semibold text-slate-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            {preview.calibration && (
                <p className="mt-3 text-xs text-slate-500">
                    Calibrated scale: <span className="text-slate-900">{preview.calibration.unitsPerPixel?.toFixed?.(4) ?? preview.calibration.unitsPerPixel} {preview.calibration.unit}/px</span>
                </p>
            )}

            {/* {preview.classBreakdown.length > 0 && (
                <div className="mt-4">
                    <p className="text-[11px] font-semibold uppercase  text-slate-900">Top classes</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {preview.classBreakdown.map(([label, value]) => (
                            <span
                                key={label}
                                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-900"
                            >
                                <span className="truncate max-w-[120px]">{label}</span>
                                <span className="rounded-full  px-2 py-0.5 text-base text-slate-700">{value}</span>
                            </span>
                        ))}
                    </div>
                </div>
            )} */}
        </section>
    );
}
