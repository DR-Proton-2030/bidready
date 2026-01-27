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
      const result = await api.auth.getUsers({});
      // getUsers returns response.data which IS the array
      if (Array.isArray(result)) {
        setUsers(result);
      } else if (result && Array.isArray(result.data)) {
        setUsers(result.data);
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

  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Role filtering with mapping
    if (activeRole !== "All") {
      filtered = filtered.filter((user) => {
        const userRole = (user.role || "").toLowerCase();
        const selectedRole = activeRole.toLowerCase();

        if (selectedRole === "admin") {
          return userRole === "admin" || userRole === "company_admin" || userRole === "client_admin";
        }
        if (selectedRole === "manager") {
          return userRole === "manager" || userRole === "project_admin";
        }
        return userRole === selectedRole;
      });
    }

    // Search filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activeRole, users, searchQuery]);

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
    searchQuery,
    setSearchQuery,
    handleRoleChange,
    handleAddUser,
    handleUpdateUser,
    handleUserAction,
    refresh: fetchUsers,
  };
};
