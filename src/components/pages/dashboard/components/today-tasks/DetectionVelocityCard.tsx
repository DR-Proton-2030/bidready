import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { PriorityItem } from "./types";

interface DetectionVelocityCardProps {
    priorityList: PriorityItem[];
    sparklineValues: number[];
}
const timeframes = ["24h", "7d", "30d"] as const;
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const DetectionVelocityCard: React.FC<DetectionVelocityCardProps> = ({
    priorityList,
    sparklineValues,
}) => {
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

    const chartSeries = useMemo(
        () => [
            {
                name: "Velocity",
                data: sparklineValues.length ? sparklineValues : [0],
            },
        ],
        [sparklineValues],
    );

    const chartOptions = useMemo<ApexOptions>(() => {
        const pointCount = sparklineValues.length || 1;
        const discreteMarker = sparklineValues.length
            ? [
                {
                    seriesIndex: 0,
                    dataPointIndex: sparklineValues.length - 1,
                    size: 7,
                    fillColor: "#7c2d12",
                    strokeColor: "#fed7aa",
                    shape: "circle",
                },
            ]
            : [];

        return {
            chart: {
                type: "area",
                height: 160,
                toolbar: { show: false },
                background: "transparent",
                foreColor: "#0f172a",
                sparkline: { enabled: true },
                animations: { enabled: true, easing: "easeinout", speed: 600 },
            },
            stroke: {
                curve: "smooth",
                width: 3,
                colors: ["#ea580c"],
            },
            fill: {
                type: "gradient",
                gradient: {
                    shadeIntensity: 0.85,
                    opacityFrom: 0.45,
                    opacityTo: 0,
                    stops: [0, 100],
                    colorStops: [
                        { offset: 0, color: "rgba(234,88,12,0.35)", opacity: 1 },
                        { offset: 100, color: "rgba(15,23,42,0)", opacity: 0 },
                    ],
                },
                colors: ["#fed7aa"],
            },
            colors: ["#f97316"],
            grid: { show: false },
            tooltip: {
                theme: "dark",
                y: {
                    formatter: (value?: number) => (value !== undefined ? `${value.toFixed(1)}%` : "0%"),
                },
            },
            dataLabels: { enabled: false },
            xaxis: {
                categories: Array.from({ length: pointCount }, (_, idx) => idx + 1),
                labels: { show: false },
                axisTicks: { show: false },
                axisBorder: { show: false },
            },
            yaxis: { show: false },
            markers: {
                size: 0,
                colors: ["#7c2d12"],
                strokeColors: ["#f97316"],
                discrete: discreteMarker,
            },
            states: { hover: { filter: { type: "none" } }, active: { filter: { type: "none" } } },
        };
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
                    <ReactApexChart type="area" height={160} options={chartOptions} series={chartSeries} />
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
