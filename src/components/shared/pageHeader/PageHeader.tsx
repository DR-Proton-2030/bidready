/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Home, Plus } from "lucide-react";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  buttonText?: string;
  link: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  buttonText,
  link,
}) => {
  return (
    <div className="b">
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-gray-200">
        {/* Title */}
        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Home className="w-5 h-5 text-gray-500" />

        </div>
      </div>
    </div>
  );
};

export default PageHeader;
