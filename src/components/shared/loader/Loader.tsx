"use client";

import React from "react";

const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[9999]">
      <div className="flex flex-col items-center gap-4">
        {/* Spinning loader circle */}
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />

        {/* Loading text */}
        <span className="text-white text-sm font-medium tracking-wide animate-pulse">
          Loading...
        </span>
      </div>
    </div>
  );
};

export default Loader;
