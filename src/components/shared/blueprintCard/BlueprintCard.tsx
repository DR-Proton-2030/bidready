"use client"
import React from 'react';
import { FileText, Clock, Download } from 'lucide-react';
import { BluePrint } from '@/@types/interface/blueprint.interface';
import { formatDate } from '@/utils/commonFunction/formatDate';


const BlueprintCard: React.FC<BluePrint> = ({
  _id,
  name,
  description,
  type,
  version,updatedAt
}) => {

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
              {type}
            </span>
          </div>
        </div>
        <button 
          className="p-2 text-gray-400 hover:text-gray-600 transition"
          aria-label={`Download ${name}`}
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
      
      <p className="text-gray-600 mb-4">{description}</p>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {updatedAt ? formatDate(updatedAt) : "N/A"}
        </div>
        <span className="font-medium">{version}</span>
      </div>
    </div>
  );
};

export default BlueprintCard;
