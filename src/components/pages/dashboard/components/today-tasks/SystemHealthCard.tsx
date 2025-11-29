import React from "react";
import { ModeToggle } from "./types";

interface SystemHealthCardProps {
    systemHealth: number;
    throughputDelta: string;
    modeToggles: ModeToggle[];
}

const SystemHealthCard: React.FC<SystemHealthCardProps> = ({
    systemHealth,
    throughputDelta,
    modeToggles,
}) => {
    const systemHealthArc = `${systemHealth * 3.6}deg`;

    return (
        <article className="relative overflow-hidden rounded-[36px] border border-white/60 bg-white/70 p-6 shadow-[0_35px_65px_rgba(15,23,42,0.12)] backdrop-blur">
            <div className="absolute inset-0 opacity-70" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, rgba(14,165,233,0.2), transparent 55%)" }} />
            <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-slate-500">System health</p>
                        <p className="text-4xl font-semibold text-slate-900">{systemHealth}%</p>
                        <p className="text-sm text-emerald-600">{throughputDelta} throughput boost</p>
                    </div>
                    <div className="relative h-32 w-32">
                        <div className="absolute inset-0 rounded-full bg-white/40" />
                        <div
                            className="absolute inset-2 rounded-full border border-white/30"
                            style={{
                                background: `conic-gradient(#0f172a ${systemHealthArc}, rgba(204, 106, 25, 1) ${systemHealthArc})`,
                            }}
                        />
                        <div className="relative flex h-full w-full items-center justify-center rounded-full text-lg font-semibold text-slate-900">
                            AI
                        </div>
                    </div>
                </div>
                <div>
                    <p className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-slate-500">Control modes</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                        {modeToggles.map(({ label, active }) => (
                            <button
                                key={label}
                                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${active ? "bg-slate-900 text-white shadow-lg" : "border border-white/60 bg-white/60 text-slate-600 backdrop-blur"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <p className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-slate-500">Next sync</p>
                    <p className="text-base font-semibold text-slate-900">Blueprint relay in 14m</p>
                    <p className="text-sm text-slate-500">Auto-push to procurement + GC teams</p>
                </div>
            </div>
        </article>
    );
};

export default SystemHealthCard;
