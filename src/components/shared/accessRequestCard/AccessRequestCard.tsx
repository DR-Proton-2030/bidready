import React from 'react';
import { AccessRequest } from '@/@types/interface/accessManagement.interface';

interface AccessRequestCardProps extends AccessRequest {
  onApprove?: (id: number) => void;
  onDeny?: (id: number) => void;
}

const AccessRequestCard: React.FC<AccessRequestCardProps> = ({
  id,
  user,
  permission,
  requestDate,
  status,
  onApprove,
  onDeny
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Denied':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = () => {
    if (onApprove) {
      onApprove(id);
    }
  };

  const handleDeny = () => {
    if (onDeny) {
      onDeny(id);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-gray-800">{user}</h3>
          <p className="text-sm text-gray-600">Requesting: {permission}</p>
        </div>
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{requestDate}</span>
        {status === 'Pending' && (
          <div className="flex gap-2">
            <button 
              className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition"
              onClick={handleApprove}
            >
              Approve
            </button>
            <button 
              className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition"
              onClick={handleDeny}
            >
              Deny
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessRequestCard;
