"use client";
import React from "react";

interface ToolButtonProps {
  icon: React.ElementType;
  label: string;
  activeTool?: string;
  onClick?: () => void;
}

const ToolButton: React.FC<ToolButtonProps> = ({
  icon: Icon,
  label,
  activeTool,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center w-12 h-12 rounded-lg transition-colors ${
      activeTool === label
        ? "bg-primary text-white"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`}
    title={label.charAt(0).toUpperCase() + label.slice(1)}
  >
    <Icon className="w-6 h-6" />
  </button>
);

export default ToolButton;
