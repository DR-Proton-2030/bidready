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
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const currentVersionName = blueprintDetails?.versions?.find((v: any) => v._id === selectedVersionId)?.version;

  return (
    <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Today</p>
        <h2 className="mt-2 text-4xl font-semibold leading-tight text-slate-900 md:text-[2.75rem]">Quantity Takeoff</h2>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-base text-slate-500">• Operational view</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        {/* Version Dropdown */}
        {blueprintDetails?.versions && blueprintDetails.versions.length > 0 && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/70 px-4 py-2.5 text-sm font-medium text-slate-700 backdrop-blur transition hover:border-white hover:bg-white"
            >
              {currentVersionName ? `Version: ${currentVersionName}` : "Select Version"}
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 origin-top-right rounded-xl border border-white/50 bg-white/80 p-1 shadow-lg backdrop-blur-xl ring-1 ring-black/5 focus:outline-none z-50">
                {blueprintDetails.versions.map((version: any) => (
                  <button
                    key={version._id}
                    onClick={() => {
                      setSelectedVersionId(version._id);
                      setIsOpen(false);
                      console.log("Selected Version ID:", version._id);
                    }}
                    className={`flex w-full uppercase items-center rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-white/50 ${selectedVersionId === version._id ? 'bg-white/50 font-semibold' : ''}`}
                  >
                    {version.version}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}


        <button className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5">
          Create Task
        </button>
      </div>
    </header>
  );
};



export default TopBar;
