"use client";
import React from "react";

const RankPerformance: React.FC = () => {
    const rows = [
        { name: "Cindy Marlina", role: "Marketing Specialist", point: 115, img: "avatar1" },
        { name: "Robbie Horrison", role: "Product Manager", point: 114, img: "avatar2" },
        { name: "Mavis Mata", role: "Customer Service", point: 115, img: "avatar3" },
    ];

    return (
        <div className="rounded-3xl border-2 border-white/80 bg-white/20 backdrop-blur-xl p-8 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-semibold text-gray-800">Rank Performance</h4>
                <button className="text-sm text-gray-500 bg-white/40 px-4 py-1 rounded-full hover:bg-white/60">See All</button>
            </div>

            <div className="space-y-6">
                {rows.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full shadow-sm bg-[#4A5565] flex items-center justify-center text-white font-bold">P</div>
                            <div>
                                <p className="font-semibold text-gray-800">{item.name}</p>
                                <p className="text-sm text-gray-500">{item.role}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">{item.point} Point</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RankPerformance;
