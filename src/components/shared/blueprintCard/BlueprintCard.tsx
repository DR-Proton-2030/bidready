import React from 'react';
import { FileText, Clock, Download } from 'lucide-react';
import { Blueprint } from '@/@types/interface/blueprint.interface';

interface BlueprintCardProps extends Blueprint {
  onDownload?: (id: number) => void;
}

const BlueprintCard: React.FC<BlueprintCardProps> = ({
  id,
  name,
  description,
  category,
  lastModified,
  version,
  onDownload
}) => {
  const handleDownload = () => {
    if (onDownload) {
      onDownload(id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <FileText className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
            <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              {category}
            </span>
          </div>
        </div>
        <button 
          className="p-2 text-gray-400 hover:text-gray-600 transition"
          onClick={handleDownload}
          aria-label={`Download ${name}`}
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
      
      <p className="text-gray-600 mb-4">{description}</p>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {lastModified}
        </div>
        <span className="font-medium">{version}</span>
      </div>
    </div>
  );
};

export default BlueprintCard;
