"use client";
import React from "react";
import { Download, Calendar1Icon, Map, ChevronRight } from "lucide-react";
import Link from "next/link";
import { BluePrint } from "@/@types/interface/blueprint.interface";
import { formatDate } from "@/utils/commonFunction/formatDate";

const BlueprintListItem: React.FC<BluePrint> = ({
    _id,
    name,
    description,
    type,
    version,
    updatedAt,
    file_url
}) => {
    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!file_url) return;

        try {
            const response = await fetch(file_url);
            if (!response.ok) throw new Error("Network response was not ok");
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const fileName = file_url.split("/").pop() || `${name}.pdf`;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
        } catch (error) {
            console.error("Download failed, opening in new tab:", error);
            window.open(file_url, "_blank");
        }
    };

    return (
        <Link
            href={`/blueprints/${_id}`}
            className="group relative flex items-center justify-between gap-6 rounded-2xl border-2 border-white/80 bg-white/50 backdrop-blur-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:bg-white/80"
        >
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="p-3 rounded-xl shadow-inner shrink-0" style={{
                    background: "linear-gradient(180deg,#ff8a33,#ff6a00)",
                }}>
                    <Map className="w-6 h-6 text-orange-100" />
                </div>

                <div className="min-w-0">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-700 truncate">
                            {name}
                        </h3>
                        <span className="inline-flex px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-600 rounded-full border border-orange-100">
                            {type}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 truncate mt-0.5 max-w-md">
                        {description}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-8 shrink-0">
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                        <Calendar1Icon className="w-3.5 h-3.5" />
                        <span>{updatedAt ? formatDate(updatedAt) : "N/A"}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                        v{version}
                    </span>

                    <div className="w-px h-8 bg-slate-200" />

                    <button
                        onClick={handleDownload}
                        className="p-2 hover:bg-orange-50 text-slate-400 hover:text-orange-500 rounded-xl transition-colors border border-transparent hover:border-orange-100"
                        title="Download Blueprint"
                    >
                        <Download className="w-5 h-5" />
                    </button>

                    <div className="p-2 text-primary/40 group-hover:text-primary transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default BlueprintListItem;
