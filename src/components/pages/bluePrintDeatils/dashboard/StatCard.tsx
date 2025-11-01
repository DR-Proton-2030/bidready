"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  delta?: string;
  gradient?: boolean;
  accentColorClass?: string; // e.g. 'orange' or 'emerald'
}

const StatCard: React.FC<StatCardProps> = ({ title, value, delta, gradient = false, accentColorClass = "orange" }) => {
  const gradientClass = gradient ? (accentColorClass === "orange" ? "bg-gradient-to-r from-orange-500 to-orange-400" : 
    "bg-gradient-to-r from-emerald-700 to-emerald-500") : "bg-gray-50";

  return (
    <div className={`rounded-2xl p-6 shadow-sm relative ${gradientClass} ${gradient ? "text-white" : ""}`}>
      <div className="flex justify-between items-start">
        <h2 className={`text-lg font-medium ${gradient ? "text-white" : "text-gray-900"}`}>{title}</h2>
        <div className={`flex items-center justify-center w-10 h-10 ${gradient ? "bg-white rounded-full" : "bg-transparent rounded-full border"}`}>
          <ArrowUpRight className={`${gradient ? "text-black w-5 h-5" : "w-4 h-4"}`} />
        </div>
      </div>

      <div className={`mt-4 ${gradient ? "text-5xl font-semibold" : "text-5xl font-semibold text-gray-900"}`}>{value}</div>

      {delta && (
        <p className={`text-sm mt-3 ${gradient ? "bg-white/20 text-white" : "text-orange-600"} w-fit px-2 py-1 rounded-full`}>
          {delta}
        </p>
      )}
    </div>
  );
};

export default StatCard;
