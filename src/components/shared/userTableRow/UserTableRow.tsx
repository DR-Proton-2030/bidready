import React from 'react';
import { Mail, Trash2, Shield, User as UserIcon } from 'lucide-react';
import { IUser } from '@/@types/interface/user.interface';
import Image from 'next/image';

interface UserTableRowProps {
  user: any;
  onDelete?: (user: any) => void;
  onEdit?: (user: any) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  onDelete,
  onEdit
}) => {
  return (
    <tr className="group hover:bg-slate-50/80 transition-all duration-200">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 relative">
            {user.profile_picture ? (
              <Image
                src={user.profile_picture}
                alt={user.full_name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-xl object-cover border border-slate-100 shadow-sm"
              />
            ) : (
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                <UserIcon size={20} />
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
              {user.full_name}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
              <Mail className="w-3 h-3" />
              {user.email}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <Shield size={14} />
          </div>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">
            {user.role || 'User'}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wider">
          Active
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit?.(user)}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            title="Edit User"
          >
            <Shield size={18} />
          </button>
          <button
            onClick={() => onDelete?.(user)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            title="Delete User"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default UserTableRow;
