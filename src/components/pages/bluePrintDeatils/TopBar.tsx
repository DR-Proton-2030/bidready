/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useRef, useState } from "react";
import { File, ChevronDown, Share2, PanelLeft } from "lucide-react";

interface TopBarProps {
  onToggleRightPanel: () => void;
  blueprintDetails?: any;
}

const TopBar: React.FC<TopBarProps> = ({
  onToggleRightPanel,
  blueprintDetails,
}) => {
  return (
    <header className="flex-shrink-0 flex items-center justify-between px-16 py-4 bg-white mb-5">
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Quanitity Takeoff</h1>
          <p className="text-gray-500">Plan description {blueprintDetails?.blueprint?.description || "No description available."}</p>
        </div>
        {/* <h1 className="text-xl font-semibold text-gray-800">
          {blueprintDetails?.name || "Untitled Blueprint"}
        </h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500 cursor-pointer">
          <File className="w-4 h-4" />
          <span>{blueprintDetails?.type || "No type"}</span>
          <ChevronDown className="w-4 h-4" />
        </div> */}
      </div>
    <div className="flex items-center gap-6">
  {/* Date Circle */}
  <div className="flex items-center justify-center w-14 h-14 rounded-full border border-gray-200 bg-white shadow-md hover:shadow-lg transition-shadow">
    <div className="text-center leading-tight">
      <div className="text-lg font-semibold text-gray-800">19</div>
    </div>
    
  </div>
      <div className="text-sm text-gray-500 -ml-3">Tue, Dec</div>

  {/* Divider */}
  <div className="h-10 w-px bg-gray-200" />

  {/* Version Dropdown */}
  <div className="min-w-[140px]">
    <VersionDropdown />
  </div>
</div>

    </header>
  );
};

const VersionDropdown: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>("Version 1");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const versions = ["Version 1", "Version 2", "Version 3", "Version 4"];

  return (
   <div ref={ref} className="relative">
  {/* Button */}
  <button
    type="button"
    onClick={() => setOpen((v) => !v)}
    className="flex items-center gap-2 bg-[#e16349] text-white px-6 py-3 rounded-full shadow-md hover:bg-orange-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
    aria-haspopup="menu"
    aria-expanded={open}
  >
    <span className="text-sm font-medium">{selected}</span>
    <ChevronDown
      className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    />
  </button>

  {/* Dropdown Menu */}
  {open && (
    <div
      className="absolute right-0 mt-3 w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden animate-scaleIn"
      role="menu"
    >
      {versions.map((v) => (
        <button
          key={v}
          onClick={() => {
            setSelected(v);
            setOpen(false);
          }}
          className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 ${
            v === selected
              ? "bg-orange-50 text-orange-600 font-semibold"
              : "hover:bg-gray-50 text-gray-700"
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  )}
</div>

  );
};

export default TopBar;
