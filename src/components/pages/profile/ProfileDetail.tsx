"use client";

import React, { useState, useEffect, useContext } from "react";
import { User, Building, Mail, Phone, Camera, Save, ArrowLeft } from "lucide-react";
import AuthContext from "@/contexts/authContext/authContext";
import { api } from "@/utils/api";
import { toast } from "react-toastify";
import { useFileUpload } from "@/hooks/useFileUpload";

const ProfileDetail: React.FC = () => {
    const { user, setUser } = useContext(AuthContext);
    const { profileFile, companyFile, handleFileSelect, resetFiles } = useFileUpload();
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
                profile_picture: typeof user.profile_picture === "string" ? user.profile_picture : "",
                company_name: user.company_details?.company_name || "",
                company_email: user.company_details?.email || "",
                company_phone: user.company_details?.phone || "",
                company_address: user.company_details?.address || "",
            });
            resetFiles();
        }
    }, [user, resetFiles]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        handleFileSelect(file, "profile");
    };

    const handleCompanyLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        handleFileSelect(file, "company");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = new FormData();
            payload.append("full_name", formData.full_name);
            const companyDetails = {
                company_name: formData.company_name,
                email: formData.company_email,
                phone: formData.company_phone,
                address: formData.company_address,
            };
            payload.append("company_details", JSON.stringify(companyDetails));

            if (profileFile.file instanceof File) {
                payload.append("user_avatar", profileFile.file);
            } else if (typeof formData.profile_picture === "string" && formData.profile_picture.trim()) {
                payload.append("profile_picture", formData.profile_picture.trim());
            }

            if (companyFile.file instanceof File) {
                payload.append("company_logo", companyFile.file);
            }

            const response = await api.auth.updateProfile(payload);
            if (response && response.data) {
                setUser(response.data);
                toast.success("Profile updated successfully");
                resetFiles();
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
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    const avatarPreview =
        profileFile.preview ||
        (typeof formData.profile_picture === "string" ? formData.profile_picture : "") ||
        (typeof user.profile_picture === "string" ? user.profile_picture : "") ||
        `https://api.dicebear.com/9.x/dylan/svg?seed=${user.full_name || "Jason"}`;
    const companyLogoPreview =
        companyFile.preview ||
        (typeof user.company_details?.logo === "string" ? user.company_details.logo : "");

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 py-8 md:px-10">
            <div className="mx-auto max-w-6xl space-y-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-500/80">
                            Profile
                        </p>
                        <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Manage your personal and company information
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsEditing(!isEditing)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 ${isEditing
                            ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                            : "bg-primary text-white shadow-lg shadow-orange-200"
                            }`}
                    >
                        {isEditing ? <ArrowLeft size={18} /> : <Save size={18} />}
                        {isEditing ? "Cancel" : "Edit Profile"}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[320px_1fr]">
                    <section className="space-y-6">
                        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                        Personal Avatar
                                    </p>
                                  
                                </div>
                                {isEditing && (
                                    <label
                                        htmlFor="profile-avatar"
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-orange-200/80 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-600"
                                    >
                                        <Camera size={14} />
                                        Change
                                    </label>
                                )}
                            </div>
                            <div className="mt-6 flex items-center gap-4">
                                <div className="relative h-24 w-24">
                                    <div className="h-full w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow">
                                        <img
                                            src={avatarPreview}
                                            alt="User avatar"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    {isEditing && (
                                        <label
                                            htmlFor="profile-avatar"
                                            className="absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-orange-200"
                                        >
                                            <Camera size={16} />
                                        </label>
                                    )}
                                    <input
                                        id="profile-avatar"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                </div>
                                <div>
                                   
                                    <p className="mt-2 text-[11px] text-slate-400">
                                        PNG or JPG, up to 10MB
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                        Company Logo
                                    </p>
                                   
                                </div>
                                {isEditing && (
                                    <label
                                        htmlFor="company-logo"
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-orange-200/80 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-600"
                                    >
                                        <Camera size={14} />
                                        Upload
                                    </label>
                                )}
                            </div>
                            <div className="mt-6 flex items-center gap-4">
                                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow">
                                    {companyLogoPreview ? (
                                        <img
                                            src={companyLogoPreview}
                                            alt="Company logo"
                                            className="h-full w-full object-contain"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center text-slate-400">
                                            <Building size={20} />
                                            <span className="mt-2 text-[10px] font-semibold">
                                                No logo
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                  
                                    <p className="mt-2 text-[11px] text-slate-400">
                                        Transparent PNG works best
                                    </p>
                                </div>
                            </div>
                            <input
                                id="company-logo"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleCompanyLogoChange}
                            />
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                                    <User size={18} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Personal Details</h2>
                                    <p className="text-sm text-slate-500">Keep your contact info accurate.</p>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
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
                                            className="w-full pl-10 pr-4 py-3 bg-white/90 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all outline-none disabled:bg-slate-50/60 disabled:text-slate-500"
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
                                            disabled={true}
                                            value={formData.email}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all outline-none disabled:bg-slate-50/70 disabled:text-slate-500 cursor-not-allowed"
                                            placeholder="Email address"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 ml-1 font-medium">Email address cannot be changed</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                                    <Building size={18} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Company Details</h2>
                                    <p className="text-sm text-slate-500">Information about your organization.</p>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Company Name</label>
                                    <input
                                        type="text"
                                        name="company_name"
                                        disabled={!isEditing}
                                        value={formData.company_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/90 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all outline-none disabled:bg-slate-50/60 disabled:text-slate-500"
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
                                            className="w-full pl-10 pr-4 py-3 bg-white/90 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all outline-none disabled:bg-slate-50/60 disabled:text-slate-500"
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
                                            className="w-full pl-10 pr-4 py-3 bg-white/90 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all outline-none disabled:bg-slate-50/60 disabled:text-slate-500"
                                            placeholder="Company contact"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                                    <input
                                        type="text"
                                        name="company_address"
                                        disabled={!isEditing}
                                        value={formData.company_address}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/90 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all outline-none disabled:bg-slate-50/60 disabled:text-slate-500"
                                        placeholder="Company address"
                                    />
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-primary text-white px-10 py-3.5 rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-xl shadow-orange-200 disabled:opacity-70 flex items-center gap-3"
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
                    </section>
                </form>
            </div>
        </div>
    );
};

export default ProfileDetail;
