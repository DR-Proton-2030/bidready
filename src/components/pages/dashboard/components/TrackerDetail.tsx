"use client";
import React from "react";

type Bar = { label: string; focus: number; break: number };

const defaultBars: Bar[] = [
    { label: "Mon", focus: 60, break: 30 },
    { label: "Tue", focus: 40, break: 20 },
    { label: "Wed", focus: 70, break: 10 },
    { label: "Thu", focus: 50, break: 30 },
    { label: "Fri", focus: 80, break: 10 },
];

const TrackerDetail: React.FC<{ bars?: Bar[] }> = ({ bars = defaultBars }) => {
    const maxHeight = 140; // height of the bar area

    return (
        <div className="rounded-3xl border-2 border-white/80 bg-white/20 backdrop-blur-xl p-8 shadow-lg hover:shadow-xl transition-all">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-semibold text-gray-800">Tracker Detail</h4>
                <button className="text-sm text-gray-500 bg-white/40 px-4 py-1 rounded-full hover:bg-white/60">
                    See All
                </button>
            </div>

            <div className="flex flex-col">
                {/* Legend */}
                <div className="flex items-center gap-4 mb-12">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#fb923c]" />
                        <span className="text-sm text-gray-500">Focus Session</span>
                    </div>
                </div>

                {/* Chart */}
                <div className="relative w-full h-40 rounded-md">
                    {/* Background grid */}
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(to_top,rgba(15,23,42,0.02)_0px,rgba(15,23,42,0.02)_8px,transparent_8px,transparent_16px)] rounded-md pointer-events-none" />

                    {/* Bars */}
                    <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 px-2">
                        {bars.map((b, i) => {
                            const barHeight = (b.focus / 100) * maxHeight;
                            const barWidth = 32;

                            return (
                                <div
                                    key={i}
                                    className="flex flex-col items-center"
                                    style={{ width: barWidth }}
                                >
                                    {/* Bar Wrapper */}
                                    <div
                                        className="
                      w-full 
                      rounded-3xl 
                      overflow-hidden 
                      border border-white/40 
                      backdrop-blur-md 
                      bg-white/20 
                      shadow-[0_6px_18px_rgba(0,0,0,0.08)]
                      flex items-end
                    "
                                        style={{ height: maxHeight }}
                                    >
                                        {/* Single-color filled bar */}
                                        <div
                                            className="w-full rounded-3xl"
                                            style={{
                                                height: barHeight,
                                                background: "linear-gradient(180deg,#ff8a33,#ff6a00)",
                                            }}
                                        />
                                    </div>

                                    {/* Label */}
                                    <div
                                        className="
                      mt-3 
                      text-[11px] 
                      px-2 py-1 
                      rounded-full 
                      bg-white 
                      shadow 
                      text-gray-700 
                      tracking-wide
                    "
                                    >
                                        {b.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackerDetail;
