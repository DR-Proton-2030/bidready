"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  delta?: string;
  gradient?: boolean;
  accentColorClass?: string; // e.g. 'from-orange-500 to-orange-400' gradient class
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, delta, gradient = false, accentColorClass = "from-orange-500 to-orange-400", Icon }) => {
  const bgClass = gradient ? "bg-gradient-to-r " + accentColorClass : "bg-white";

  const deltaIsPositive = typeof delta === 'string' ? !!delta.match(/(↑|\+|increase|increased|up)/i) : undefined;
  const deltaClass = deltaIsPositive === undefined ? 'text-slate-600' : (deltaIsPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700');

  return (
    <article className={`rounded-[20px] border border-white/20 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.08)] backdrop-blur transition-transform hover:-translate-y-1 ${false ? bgClass : 'bg-white'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${accentColorClass ?? 'from-orange-400 to-orange-600'} shadow-sm`}>
            {Icon ? <Icon className="w-5 h-5 text-white" /> : <ArrowUpRight className="w-4 h-4 text-white" />}
          </div>
          <div>
            <h3 className={`text-sm font-semibold text-black`}>{title}</h3>
          </div>
        </div>
        <div className="ml-auto">
          {/* Optional mini-menu/placeholder for future actions */}
        </div>
      </div>

      <div className={`mt-4 text-3xl font-semibold text-black`}>{value}</div>

      {/* {delta && (
        <div className={`inline-block mt-3 ${deltaClass} px-3 py-1 rounded-full text-sm font-medium`}>{delta}</div>
      )} */}
    </article>
  );
};

export default StatCard;
