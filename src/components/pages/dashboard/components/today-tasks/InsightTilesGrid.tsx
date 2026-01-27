import React from "react";
import { InsightTile } from "./types";

interface InsightTilesGridProps {
    insightTiles: InsightTile[];
}

const InsightTilesGrid: React.FC<InsightTilesGridProps> = ({ insightTiles }) => (
    <div className="grid gap-4">
        {insightTiles.map(({ title, value, delta, caption, tone }) => (
            <article key={title} className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/50 p-5 shadow-[0_25px_55px_rgba(15,23,42,0.1)] backdrop-blur">
                <div className={`absolute inset-0 bg-gradient-to-br ${tone} opacity-80`} />
                <div className="absolute inset-0 bg-white/60 mix-blend-screen" />
                <div className="relative">
                    <p className="text-sm font-medium text-slate-600">{title}</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                        {delta && <span className="rounded-full bg-white/70 px-3 py-0.5 font-semibold text-emerald-600 backdrop-blur">{delta}</span>}
                        <span className="text-slate-600">{caption}</span>
                    </div>
                </div>
            </article>
        ))}
    </div>
);

export default InsightTilesGrid;
