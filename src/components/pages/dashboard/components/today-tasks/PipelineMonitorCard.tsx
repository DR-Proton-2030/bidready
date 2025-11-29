import React from "react";
import { PipelineStage } from "./types";

interface PipelineMonitorCardProps {
    pipelineStages: PipelineStage[];
}

const PipelineMonitorCard: React.FC<PipelineMonitorCardProps> = ({ pipelineStages }) => (
    <article className="rounded-[36px] border border-white/60 bg-white/70 p-6 shadow-[0_35px_65px_rgba(15,23,42,0.12)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <p className="text-sm text-slate-500">Workflow pipeline</p>
                <h3 className="text-2xl font-semibold text-slate-900">Signal path monitor</h3>
            </div>
            <button className="rounded-2xl border border-white/60 bg-white/60 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur transition hover:border-white">
                Download log
            </button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
            {pipelineStages.map(({ name, detail, metric, progress }) => (
                <div key={name} className="rounded-2xl border border-white/60 bg-white/60 p-4 backdrop-blur">
                    <div className="flex items-center justify-between text-sm">
                        <div>
                            <p className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-slate-500">{detail}</p>
                            <p className="text-lg font-semibold text-slate-900">{name}</p>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">{metric}</span>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-slate-100/80">
                        <div className="h-full rounded-full bg-gradient-to-r from-slate-900 to-slate-700" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            ))}
        </div>
    </article>
);

export default PipelineMonitorCard;
