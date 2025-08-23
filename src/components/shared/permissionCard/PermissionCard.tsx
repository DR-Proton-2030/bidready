import React from 'react';
import { Users, Settings } from 'lucide-react';
import { Permission } from '@/@types/interface/accessManagement.interface';

interface PermissionCardProps extends Permission {
  onEdit?: (id: number) => void;
}

const PermissionCard: React.FC<PermissionCardProps> = ({
  id,
  name,
  description,
  users,
  lastUpdated,
  onEdit
}) => {
  const handleEdit = () => {
    if (onEdit) {
      onEdit(id);
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-800">{name}</h3>
        <button 
          className="p-1 text-gray-400 hover:text-gray-600 transition"
          onClick={handleEdit}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {users} users
        </div>
        <span>Updated {lastUpdated}</span>
      </div>
    </div>
  );
};

export default PermissionCard;
