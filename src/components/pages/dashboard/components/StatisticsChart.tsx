"use client";
import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const chartColors = ["#DDE2FF", "#6366F1", "#DDE2FF", "#6366F1", "#DDE2FF"];
const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const getFallbackMonthlyActivity = () => {
  const now = new Date();
  return Array.from({ length: 5 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 4 + index, 1);
    return { month: monthLabels[date.getMonth()], count: 0 };
  });
};

interface StatisticsChartProps {
  monthlyActivity?: { month: string; count: number }[];
}

const StatisticsChart: React.FC<StatisticsChartProps> = ({ monthlyActivity = [] }) => {
  const fallbackActivity = getFallbackMonthlyActivity();
  const displayActivity = monthlyActivity.length === 5 ? monthlyActivity : fallbackActivity;
  const categories = displayActivity.map((item) => item.month);
  const data = displayActivity.map((item) => item.count);
  const maxValue = Math.max(...data, 10);
  const yAxisMax = Math.ceil(maxValue / 10) * 10;

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
    colors: chartColors,
    xaxis: {
      categories,
      labels: {
        style: { colors: "#94A3B8", fontSize: "11px", fontWeight: 500 },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      max: yAxisMax,
      tickAmount: 3,
      labels: {
        style: { colors: "#94A3B8", fontSize: "11px", fontWeight: 500 },
      },
    },
  };

  const chartSeries = [
    {
      name: "Blueprints",
      data,
    },
  ];

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
