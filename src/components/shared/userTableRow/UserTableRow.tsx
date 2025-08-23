import React from 'react';
import { Mail, MoreVertical } from 'lucide-react';
import { User } from '@/@types/interface/user.interface';

interface UserTableRowProps extends User {
  onActionClick?: (id: number) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({
  id,
  name,
  email,
  role,
  status,
  lastActive,
  avatar,
  onActionClick
}) => {
  const getStatusColor = (status: string) => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const handleActionClick = () => {
    if (onActionClick) {
      onActionClick(id);
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-medium">
              {avatar}
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{name}</div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {email}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {role}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {lastActive}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <button 
          className="p-1 text-gray-400 hover:text-gray-600 transition"
          onClick={handleActionClick}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};

export default UserTableRow;
