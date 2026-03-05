"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ProjectStatusChartProps {
    title: string;
    distributionData: { label: string; value: number }[];
}

const ProjectStatusChart: React.FC<ProjectStatusChartProps> = ({ title, distributionData }) => {
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
            fontSize: "11px",
            fontWeight: 600,
            labels: { colors: "#475569" },
            markers: { size: 4, strokeWidth: 0, offsetX: -4 }
        },
        plotOptions: {
            pie: {
                expandOnClick: false,
                donut: {
                    size: "70%",
                    labels: {
                        show: true,
                        name: { show: true, fontSize: "11px", color: "#64748b", fontWeight: 600 },
                        value: { show: true, fontSize: "16px", color: "#1e293b", fontWeight: 700 },
                        total: {
                            show: true,
                            label: "Total",
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
        <div className="rounded-[32px] border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur-xl h-full">
            <div className="mb-4 text-center">
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{title}</h3>
            </div>
            <div className="h-[220px] w-full flex items-center justify-center">
                {distributionData.length > 0 ? (
                    <Chart options={pieOptions} series={pieSeries} type="donut" height="100%" />
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 font-medium">
                        No projects found
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectStatusChart;