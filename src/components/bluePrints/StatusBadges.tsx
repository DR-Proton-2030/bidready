"use client";
import React from "react";

interface Props {
  options: string[];
  active: string;
  onChange: (status: string) => void;
}

const StatusBadges: React.FC<Props> = ({ options, active, onChange }) => (
  <div className="flex items-start justify-between px-6 py-6 gap-8">
    <div className="flex-1">
      <label className="block font-medium mb-1">Status</label>
      <p className="text-sm text-gray-500">Select the current status.</p>
    </div>
    <div className="flex-1">
      <div className="flex flex-wrap gap-3">
        {options.map((status) => {
          const isActive = active === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => onChange(status)}
              className={`px-5 py-2 rounded-full font-medium text-sm transition ${
                isActive
                  ? "bg-primary text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

export default StatusBadges;
