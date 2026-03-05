"use client";

import React from "react";
import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  delta?: string;
  gradient?: boolean;
  accentColorClass?: string;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  delta,
  gradient = false,
  accentColorClass = "from-orange-500 to-orange-400",
  Icon,
}) => {
  const deltaIsPositive =
    typeof delta === "string"
      ? !!delta.match(/(↑|\+|increase|increased|up)/i)
      : undefined;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-slate-300/70">


      {/* Decorative gradient blob */}
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${accentColorClass} opacity-[0.07] blur-2xl transition-opacity duration-300 group-hover:opacity-[0.12]`}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${accentColorClass} shadow-md transition-transform duration-300 group-hover:scale-110`}
          >
            {Icon ? (
              <Icon className="w-[18px] h-[18px] text-white" />
            ) : (
              <ArrowUpRight className="w-4 h-4 text-white" />
            )}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <p className="mt-1.5 text-3xl font-bold tracking-tight text-slate-900">
            {value ?? 0}
          </p>
        </div>


      </div>
    </article>
  );
};

export default StatCard;
