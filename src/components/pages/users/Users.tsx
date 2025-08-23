'use client';

import React from 'react';
import { PageHeader, CategoryFilter, UserTableRow } from '@/components/shared';
import { useUsers } from '@/hooks/useUsers/useUsers';
import { USER_ROLES, USERS_TEXT } from '@/constants/users/users.constant';

const Users: React.FC = () => {
  const {
    activeRole,
    filteredUsers,
    handleRoleChange,
    handleAddUser,
    handleUserAction,
  } = useUsers();

  return (
    <div className="space-y-6">
      <PageHeader 
        title={USERS_TEXT.pageTitle}
        buttonText={USERS_TEXT.addUserButton}
        onButtonClick={handleAddUser}
      />

      <CategoryFilter 
        categories={USER_ROLES}
        activeCategory={activeRole}
        onCategoryChange={handleRoleChange}
      />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {USERS_TEXT.userTableHeaders.user}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {USERS_TEXT.userTableHeaders.role}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {USERS_TEXT.userTableHeaders.status}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {USERS_TEXT.userTableHeaders.lastActive}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {USERS_TEXT.userTableHeaders.actions}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <UserTableRow
                  key={user.id}
                  {...user}
                  onActionClick={handleUserAction}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
