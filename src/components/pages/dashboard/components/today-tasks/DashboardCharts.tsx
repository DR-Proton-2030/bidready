"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DashboardChartsProps {
    activityData: { day: string; count: number }[];
    distributionData: { label: string; value: number }[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
    activityData,
    distributionData
}) => {
    // Activity Area Chart Options (Matching provided UI image)
    const areaOptions: ApexOptions = {
        chart: {
            type: "area",
            toolbar: { show: false },
            zoom: { enabled: false },
            sparkline: { enabled: false },
            background: 'transparent',
        },
        colors: ["#0ea5e9"], // Vibrant blue from the image
        dataLabels: { enabled: false },
        stroke: {
            curve: "smooth", // Spline curve
            width: 4,
        },
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.25, // Light blue fill
                opacityTo: 0.05,
                stops: [0, 90, 100]
            }
        },
        markers: {
            size: 0,
            colors: ["#0ea5e9"],
            strokeColors: "#fff",
            strokeWidth: 3,
            hover: {
                size: 6,
            }
        },
        xaxis: {
            categories: activityData.map(d => new Date(d.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            axisBorder: { show: false },
            axisTicks: { show: false },
            crosshairs: {
                show: true,
                stroke: {
                    color: '#94a3b8',
                    width: 1,
                    dashArray: 4,
                },
            },
            labels: {
                style: { colors: "#94a3b8", fontSize: '12px', fontWeight: 500 }
            }
        },
        yaxis: {
            labels: {
                style: { colors: "#94a3b8", fontSize: '12px', fontWeight: 500 },
                formatter: (val) => val.toFixed(0)
            }
        },
        grid: {
            borderColor: "#f1f5f9",
            strokeDashArray: 0, // Solid lines like the image
            xaxis: {
                lines: { show: true } // Vertical lines like the image
            },
            yaxis: {
                lines: { show: true } // Horizontal lines like the image
            },
            padding: { top: 10, left: 20, right: 20, bottom: 0 }
        },
        tooltip: {
            theme: "dark", // Dark tooltip like the image
            x: { show: false },
            marker: { show: false },
            y: {
                formatter: (val) => `${val} uploads`,
                title: { formatter: () => "" }
            },
            style: {
                fontSize: '12px',
            },
        }
    };

    const areaSeries = [{
        name: "Blueprints Uploaded",
        data: activityData.map(d => d.count)
    }];

    // Distribution Pie Chart Options
    const pieOptions: ApexOptions = {
        chart: {
            type: "donut",
        },
        labels: distributionData.map(d => d.label),
        colors: ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#64748b"],
        stroke: { show: false },
        dataLabels: { enabled: false },
        legend: {
            position: "bottom",
            fontSize: "12px",
            fontWeight: 600,
            labels: { colors: "#475569" },
            markers: { size: 6, strokeWidth: 0, offsetX: -4 }
        },
        plotOptions: {
            pie: {
                expandOnClick: false,
                donut: {
                    size: "75%",
                    labels: {
                        show: true,
                        name: { show: true, fontSize: "12px", color: "#64748b", fontWeight: 600 },
                        value: { show: true, fontSize: "20px", color: "#1e293b", fontWeight: 700 },
                        total: {
                            show: true,
                            label: "Total Projects",
                            color: "#64748b",
                            formatter: function (w) {
                                return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)
                            }
                        }
                    }
                }
            }
        }
    };

    const pieSeries = distributionData.map(d => d.value);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Area Chart */}
            <div className="lg:col-span-2 rounded-[36px] border border-white/60 bg-white/70 p-8 shadow-[0_35px_65px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Upload Activity</h3>
                        <p className="text-sm text-slate-500 font-medium mt-1">Daily blueprint ingestion volume</p>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                </div>
                <div className="h-[300px] w-full">
                    {activityData.length > 0 ? (
                        <Chart options={areaOptions} series={areaSeries} type="area" height="100%" />
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 font-medium">
                            No activity recorded in the last 7 days
                        </div>
                    )}
                </div>
            </div>

            {/* Pie Chart */}
            <div className="rounded-[36px] border border-white/60 bg-white/70 p-8 shadow-[0_35px_65px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Project Status</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">Regional distribution</p>
                </div>
                <div className="h-[300px] w-full flex items-center justify-center">
                    {distributionData.length > 0 ? (
                        <Chart options={pieOptions} series={pieSeries} type="donut" height="100%" />
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 font-medium">
                            No projects found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
