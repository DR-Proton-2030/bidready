import React from "react";
import { QuickStat } from "./types";

interface QuickStatsGridProps {
    stats: QuickStat[];
}

const QuickStatsGrid: React.FC<QuickStatsGridProps> = ({ stats }) => (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, trend, progress, accent, Icon }) => (
            <article
                key={label}
                className="rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.12)] backdrop-blur"
            >
                <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${accent}`}>
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-slate-500">{label}</p>
                        <p className="text-3xl font-semibold text-slate-900">{value}</p>
                    </div>
                </div>
                <p className="mt-4 text-sm text-slate-500">{trend}</p>
                {/* <div className="mt-3 h-2 rounded-full bg-slate-100/90">
                    <div className="h-full rounded-full bg-gradient-to-r from-slate-900 to-slate-700" style={{ width: `${progress}%` }} />
                </div> */}
            </article>
        ))}
    </div>
);

export default QuickStatsGrid;
