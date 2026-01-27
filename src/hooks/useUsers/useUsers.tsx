"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { api } from "@/utils/api";
import { toast } from "react-toastify";

export const useUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<string>("All");

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.auth.getUsers({});
      if (response && response.data) {
        setUsers(response.data);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    return activeRole === "All"
      ? users
      : users.filter((user) => user.role === activeRole);
  }, [activeRole, users]);

  const handleRoleChange = (role: string) => {
    setActiveRole(role);
  };

  const handleAddUser = async (payload: any) => {
    try {
      await api.auth.createUsers(payload);
      toast.success("User added successfully");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to add user");
    }
  };

  const handleUpdateUser = async (userId: string, payload: any) => {
    try {
      await api.auth.updateUser(userId, payload);
      toast.success("User updated successfully");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to update user");
    }
  };

  const handleUserAction = async (action: string, user: any) => {
    if (action === "delete") {
      if (confirm(`Are you sure you want to delete ${user.full_name}?`)) {
        try {
          await api.auth.deleteUser(user._id);
          toast.success("User deleted successfully");
          fetchUsers();
        } catch (error: any) {
          toast.error(error.message || "Failed to delete user");
        }
      }
    }
    // Add edit logic here if needed
  };

  return {
    activeRole,
    filteredUsers,
    isLoading,
    handleRoleChange,
    handleAddUser,
    handleUpdateUser,
    handleUserAction,
    refresh: fetchUsers,
  };
};
