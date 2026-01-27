"use client";

import React, { useState, useEffect, useContext } from "react";
import { User, Building, Mail, Phone, Camera, Save, ArrowLeft } from "lucide-react";
import AuthContext from "@/contexts/authContext/authContext";
import { api } from "@/utils/api";
import { toast } from "react-toastify";
import Image from "next/image";

const ProfileDetail: React.FC = () => {
    const { user, setUser } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        profile_picture: "",
        company_name: "",
        company_email: "",
        company_phone: "",
        company_address: "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || "",
                email: user.email || "",
                profile_picture: user.profile_picture || "",
                company_name: user.company_details?.company_name || "",
                company_email: user.company_details?.email || "",
                company_phone: user.company_details?.phone || "",
                company_address: user.company_details?.address || "",
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = {
                full_name: formData.full_name,
                profile_picture: formData.profile_picture,
                company_details: {
                    company_name: formData.company_name,
                    email: formData.company_email,
                    phone: formData.company_phone,
                    address: formData.company_address,
                },
            };
            const response = await api.auth.updateProfile(payload);
            if (response && response.data) {
                setUser(response.data);
                toast.success("Profile updated successfully");
                setIsEditing(false);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 bg-gradient-to-br from-slate-50 to-slate-100 min-h-[calc(100vh-64px)]">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
                        <p className="text-slate-500 mt-1">Manage your personal and company information</p>
                    </div>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 ${isEditing
                            ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
                            }`}
                    >
                        {isEditing ? <ArrowLeft size={18} /> : <Save size={18} />}
                        {isEditing ? "Cancel" : "Edit Profile"}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* User Profile Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                        <div className="px-8 pb-8 -mt-16">
                            <div className="relative inline-block">
                                <div className="w-32 h-32 rounded-3xl border-4 border-white overflow-hidden bg-slate-100 shadow-md">
                                    {formData.profile_picture ? (
                                        <Image
                                            src={formData.profile_picture}
                                            alt="Avatar"
                                            width={128}
                                            height={128}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <User size={48} />
                                        </div>
                                    )}
                                </div>
                                {isEditing && (
                                    <button
                                        type="button"
                                        className="absolute bottom-1 right-1 bg-white p-2 rounded-xl shadow-lg border border-slate-100 text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                        <Camera size={20} />
                                    </button>
                                )}
                            </div>

                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            name="full_name"
                                            disabled={!isEditing}
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none disabled:bg-slate-50/50 disabled:text-slate-500"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            disabled={true} // Email typically not editable
                                            value={formData.email}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none disabled:bg-slate-50/50 disabled:text-slate-500 cursor-not-allowed"
                                            placeholder="Email address"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 ml-1 font-medium">Email address cannot be changed</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Company Info Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                <Building size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Company Details</h2>
                                <p className="text-sm text-slate-500">Information about your organization</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Company Name</label>
                                <input
                                    type="text"
                                    name="company_name"
                                    disabled={!isEditing}
                                    value={formData.company_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none disabled:bg-slate-50/50 disabled:text-slate-500"
                                    placeholder="Enter company name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Company Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        name="company_email"
                                        disabled={!isEditing}
                                        value={formData.company_email}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none disabled:bg-slate-50/50 disabled:text-slate-500"
                                        placeholder="Company email"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Company Phone</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Phone size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="company_phone"
                                        disabled={!isEditing}
                                        value={formData.company_phone}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none disabled:bg-slate-50/50 disabled:text-slate-500"
                                        placeholder="Company contact"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                                <input
                                    type="text"
                                    name="company_address"
                                    disabled={!isEditing}
                                    value={formData.company_address}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none disabled:bg-slate-50/50 disabled:text-slate-500"
                                    placeholder="Company address"
                                />
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-blue-600 text-white px-10 py-3.5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-70 flex items-center gap-3"
                            >
                                {isLoading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                ) : (
                                    <Save size={20} />
                                )}
                                {isLoading ? "Saving Changes..." : "Save Profile Information"}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ProfileDetail;
