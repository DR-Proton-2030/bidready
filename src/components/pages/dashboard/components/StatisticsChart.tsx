"use client";
import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const chartOptions: ApexOptions = {
  chart: {
    type: "bar",
    toolbar: { show: false },
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: "60%",
      distributed: true,
    },
  },
  dataLabels: { enabled: false },
  legend: { show: false },
  grid: {
    show: true,
    borderColor: "#F1F5F9",
    strokeDashArray: 4,
    yaxis: { lines: { show: true } },
    xaxis: { lines: { show: false } },
    padding: { top: 0, right: 0, bottom: 0, left: 10 },
  },
  colors: ["#DDE2FF", "#6366F1", "#DDE2FF", "#6366F1", "#DDE2FF"],
  xaxis: {
    categories: ["1 Aug", "", "11 Aug", "", "21Aug"],
    labels: {
      style: { colors: "#94A3B8", fontSize: "11px", fontWeight: 500 },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    min: 0,
    max: 60,
    tickAmount: 3,
    labels: {
      style: { colors: "#94A3B8", fontSize: "11px", fontWeight: 500 },
    },
  },
};

const chartSeries = [
  {
    name: "Statistic",
    data: [35, 48, 35, 60, 32],
  },
];

const StatisticsChart: React.FC = () => {
  return (
    <div className="bg-[#f2f5fd] rounded-[32px] p-6">
      <div className="h-40 w-full">
        <Chart
          options={chartOptions}
          series={chartSeries}
          type="bar"
          height="100%"
        />
      </div>
    </div>
  );
};

export default StatisticsChart;
