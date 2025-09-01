/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Home, Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  buttonText?: string;
  onButtonClick: any;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  buttonText,
  onButtonClick,
}) => {
  return (
    <div className="b">
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-gray-200">
        {/* Title */}
        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Home className="w-5 h-5 text-gray-500" />
          <div
            onClick={onButtonClick}
            className="bg-primary cursor-pointer flex gap-2 items-center text-white pl-3 pr-5 py-2 rounded-lg font-medium"
          >
            <Plus className="w-5 h-5" />
            {buttonText}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
