"use client";

import React, { useState } from "react";
import { UserTableRow, LoadingSpinner, Modal } from "@/components/shared";
import { useUsers } from "@/hooks/useUsers/useUsers";
import { Users as UsersIcon, Plus, Shield, Search } from "lucide-react";

const Users: React.FC = () => {
  const {
    activeRole,
    filteredUsers,
    isLoading,
    searchQuery,
    setSearchQuery,
    handleRoleChange,
    handleAddUser,
    handleUpdateUser,
    handleUserAction,
  } = useUsers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "user",
  });

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({ full_name: "", email: "", password: "", role: "user" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: any) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name || "",
      email: user.email || "",
      password: "", // Don't show password
      role: user.role || "user",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      await handleUpdateUser(editingUser._id, formData);
    } else {
      await handleAddUser(formData);
    }
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <UsersIcon className="text-blue-600" size={32} />
            Access Management
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Manage organization members and their system roles</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} />
          Add New Member
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 w-full md:w-96 shadow-sm">
            <Search className="text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {["All", "Admin", "User", "Manager"].map((role) => (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeRole === role
                  ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                  : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-100"
                  }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Member</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Access Level</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {filteredUsers.map((user) => (
                <UserTableRow
                  key={user._id}
                  user={user}
                  onEdit={handleOpenEditModal}
                  onDelete={(u) => handleUserAction("delete", u)}
                />
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-20 flex flex-col items-center justify-center text-slate-400">
              <div className="p-6 bg-slate-50 rounded-full mb-4">
                <UsersIcon size={48} className="opacity-20" />
              </div>
              <p className="font-bold uppercase tracking-widest text-xs">No members found</p>
            </div>
          )}
        </div>
      </div>

      {/* User Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser ? "Edit Member" : "Add New Member"} size="lg">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              {editingUser ? <Shield size={24} /> : <Plus size={24} />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{editingUser ? "Edit Member Details" : "New Team Member"}</h2>
              <p className="text-sm text-slate-500 font-medium">{editingUser ? "Update access levels and info" : "Create a new account for your team"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="john@example.com"
              />
            </div>

            {!editingUser && (
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Initial Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Role</label>
              <select
                value={formData.role ?? "user"}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-700"
              >
                <option value="user">Standard User</option>
                <option value="project_admin">Manager</option>
                <option value="company_admin">Administrator</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-100"
            >
              {editingUser ? "Save Changes" : "Add Member"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
