'use client';

import { useState, useMemo } from 'react';
import { User } from '@/@types/interface/user.interface';
import { USERS_DATA, USERS_TEXT } from '@/constants/users/users.constant';

export const useUsers = () => {
  const [activeRole, setActiveRole] = useState<string>("All");

  const filteredUsers = useMemo(() => {
    return activeRole === "All" 
      ? USERS_DATA 
      : USERS_DATA.filter(user => user.role === activeRole);
  }, [activeRole]);

  const handleRoleChange = (role: string) => {
    setActiveRole(role);
  };

  const handleAddUser = () => {
    console.log('Adding new user...');
    // Add actual user creation logic here
  };

  const handleUserAction = (id: number) => {
    console.log(`User action for id: ${id}`);
    // Add user action logic here (edit, delete, etc.)
  };

  return {
    activeRole,
    filteredUsers,
    handleRoleChange,
    handleAddUser,
    handleUserAction,
  };
};
