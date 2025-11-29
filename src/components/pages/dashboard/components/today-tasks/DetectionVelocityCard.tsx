import React, { useId, useMemo } from "react";
import { PriorityItem } from "./types";

interface DetectionVelocityCardProps {
    priorityList: PriorityItem[];
    sparklinePoints: string;
    sparklineValues: number[];
}

const chartWidth = 200;
const chartHeight = 80;
const timeframes = ["24h", "7d", "30d"] as const;

const DetectionVelocityCard: React.FC<DetectionVelocityCardProps> = ({
    priorityList,
    sparklinePoints,
    sparklineValues,
}) => {
    const chartId = useId();
    const [activeFrame] = timeframes;

    const { min, max, latest, delta } = useMemo(() => {
        if (!sparklineValues.length) {
            return { min: 0, max: 0, latest: 0, delta: 0 };
        }
        const minVal = Math.min(...sparklineValues);
        const maxVal = Math.max(...sparklineValues);
        const latestVal = sparklineValues[sparklineValues.length - 1];
        const deltaVal = latestVal - sparklineValues[0];
        return { min: minVal, max: maxVal, latest: latestVal, delta: deltaVal };
    }, [sparklineValues]);

    const lastPoint = useMemo(() => {
        if (!sparklineValues.length) return { x: 0, y: chartHeight };
        const index = sparklineValues.length - 1;
        const denominator = Math.max(sparklineValues.length - 1, 1);
        const x = (index / denominator) * chartWidth;
        const y = chartHeight - (sparklineValues[index] / 100) * chartHeight;
        return { x, y };
    }, [sparklineValues]);

    return (
        <article className="w-full lg:flex-[1.15] space-y-8 rounded-[36px] border border-white/70 bg-gradient-to-br from-white/95 via-slate-50/80 to-amber-50/70 p-6 shadow-[0_35px_90px_rgba(15,23,42,0.12)]">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                    <p className="text-sm font-medium uppercase tracking-[0.35em] text-slate-400">Detection velocity</p>
                    <div className="flex items-baseline gap-3">
                        <h3 className="text-4xl font-semibold text-slate-900">{latest}%</h3>
                        <span className={`text-sm font-semibold ${delta >= 0 ? "text-orange-600" : "text-rose-600"}`}>
                            {delta >= 0 ? "+" : ""}
                            {delta.toFixed(1)} pts
                        </span>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-500">real-time boost</p>
                </div>
                <div className="flex flex-col gap-4 md:items-end">
                    <div className="rounded-[26px] border border-white/70 bg-white/80 px-5 py-4 text-center shadow-sm md:text-right">
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Current shift</p>
                        <p className="text-lg font-semibold text-slate-900">High throughput</p>
                        <p className="text-sm font-medium text-orange-500">98% confidence median</p>
                    </div>
                    <div className="flex gap-2 self-stretch md:self-end">
                        {timeframes.map((frame) => (
                            <button
                                key={frame}
                                className={`flex-1 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide transition md:flex-none ${frame === activeFrame
                                        ? "border-slate-900 bg-slate-900 text-white shadow"
                                        : "border-white/70 bg-white/60 text-slate-500"
                                    }`}
                            >
                                {frame}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <section className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-inner">
                <div className="flex flex-wrap items-center justify-between text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-slate-400">
                    <span>velocity trend</span>
                    <span>
                        range {min.toFixed(1)}% – {max.toFixed(1)}%
                    </span>
                </div>
                <div className="mt-4">
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-36 w-full text-orange-500">
                        <defs>
                            <linearGradient id={`${chartId}-stroke`} x1="0" x2="1" y1="0" y2="0">
                                <stop offset="0%" stopColor="#fb923c" />
                                <stop offset="100%" stopColor="#7c2d12" />
                            </linearGradient>
                            <linearGradient id={`${chartId}-fill`} x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="rgba(251,146,60,0.45)" />
                                <stop offset="100%" stopColor="rgba(15,23,42,0)" />
                            </linearGradient>
                        </defs>

                        {[0.25, 0.5, 0.75].map((ratio) => (
                            <line
                                key={ratio}
                                x1={0}
                                y1={chartHeight * ratio}
                                x2={chartWidth}
                                y2={chartHeight * ratio}
                                stroke="rgba(148,163,184,0.2)"
                                strokeDasharray="4 6"
                                strokeWidth={1}
                            />
                        ))}

                        <polyline fill={`url(#${chartId}-fill)`} stroke="none" points={`0,${chartHeight} ${sparklinePoints} ${chartWidth},${chartHeight}`} />
                        <polyline
                            fill="none"
                            stroke={`url(#${chartId}-stroke)`}
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={sparklinePoints}
                        />

                        <circle cx={lastPoint.x} cy={lastPoint.y} r={5} fill="#7c2d12" stroke="#fb923c" strokeWidth={2} />
                        <text x={lastPoint.x + 8} y={lastPoint.y - 8} fill="#7c2d12" fontSize={10} fontWeight={600}>
                            {latest.toFixed(1)}%
                        </text>
                    </svg>
                </div>
                <div className="mt-5 grid gap-3 text-center text-sm font-semibold text-slate-700 sm:grid-cols-3">
                    {[
                        { label: "Peak", value: `${max.toFixed(1)}%` },
                        { label: "Floor", value: `${min.toFixed(1)}%` },
                        { label: "Throughput", value: "112 ops/hr" },
                    ].map(({ label, value }) => (
                        <div key={label} className="rounded-2xl border border-white/60 bg-white/80 px-4 py-3">
                            <p className="text-[0.6rem] font-medium uppercase tracking-[0.35em] text-slate-400">{label}</p>
                            <p className="text-xl text-slate-900">{value}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
                {priorityList.map(({ title, subtitle, due, status, chip, chipClass, statusClass, Icon }) => (
                    <div key={title} className="rounded-[26px] border border-white/60 bg-white/80 p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-white p-2 shadow">
                                <Icon className="h-4 w-4 text-slate-600" />
                            </div>
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${chipClass}`}>{chip}</span>
                        </div>
                        <h4 className="mt-4 text-base font-semibold text-slate-900">{title}</h4>
                        <p className="text-sm text-slate-500">{subtitle}</p>
                        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                            <span>Due {due}</span>
                            <span className={`font-semibold ${statusClass}`}>{status}</span>
                        </div>
                    </div>
                ))}
            </section>
        </article>
    );
};

export default DetectionVelocityCard;
