import React from 'react';
import { Shield } from 'lucide-react';
import { Role } from '@/@types/interface/accessManagement.interface';

interface RoleCardProps extends Role {
  onClick?: (role: string) => void;
}

const RoleCard: React.FC<RoleCardProps> = ({
  name,
  description,
  onClick
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(name);
    }
  };

  return (
    <div 
      className="border rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer"
      onClick={handleClick}
    >
      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
        <Shield className="w-6 h-6 text-white" />
      </div>
      <h3 className="font-semibold text-gray-800 mb-1">{name}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
};

export default RoleCard;
