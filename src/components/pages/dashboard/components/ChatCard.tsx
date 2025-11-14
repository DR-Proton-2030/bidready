"use client";
import React from "react";

const ChatCard: React.FC = () => {
    return (
        <div className="rounded-3xl border-2 border-white/80 bg-white/20 backdrop-blur-xl p-8 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-semibold text-gray-800">Chat</h4>
                <button className="text-sm text-gray-500 bg-white/40 px-4 py-1 rounded-full hover:bg-white/60">See All</button>
            </div>

            <div className="space-y-4">
                <p className="text-sm text-gray-700">John Doe</p>
                <p className="bg-purple-100 px-4 py-2 rounded-2xl text-sm shadow-sm inline-block">Hello can you check the latest work ?</p>
                <p className="bg-rose-100 px-4 py-2 rounded-2xl text-sm shadow-sm inline-block">[voice message] 00:41</p>
            </div>
        </div>
    );
};

export default ChatCard;
