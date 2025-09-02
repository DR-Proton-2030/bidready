"use client";
import React from "react";

interface Props {
  title?: string;
  description?: React.ReactNode;
}

const Header: React.FC<Props> = ({
  title = "Create Blueprint",
  description,
}) => {
  return (
    <div className="flex items-start justify-between px-6 pt-6 pb-6 gap-8 border-b border-gray-200">
      <div className="flex-1">
        <h2 className="text-3xl font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">
        <button
          type="submit"
          className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-black transition shadow-md"
        >
          Create Blueprint
        </button>
      </div>
    </div>
  );
};

export default Header;
