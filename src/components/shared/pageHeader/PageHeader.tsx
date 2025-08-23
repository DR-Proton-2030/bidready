import React from 'react';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  buttonText: string;
  onButtonClick?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  buttonText,
  onButtonClick
}) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      <button 
        className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-hover transition"
        onClick={onButtonClick}
      >
        <Plus className="w-4 h-4" />
        {buttonText}
      </button>
    </div>
  );
};

export default PageHeader;
