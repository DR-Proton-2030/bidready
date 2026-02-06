"use client";

import React, { useState, useEffect } from "react";
import {
    Settings as SettingsIcon,
    Bell,
    Lock,
    Palette,
    Globe,
    CreditCard,
    Shield,
    Zap,
    ChevronRight,
    Moon,
    Sun,
    Check,
    Save,
    Loader2,
    Monitor,
} from "lucide-react";
import { toast } from "react-toastify";

interface SettingSection {
    id: string;
    label: string;
    icon: React.ReactNode;
    description: string;
}

const settingSections: SettingSection[] = [
    {
        id: "notifications",
        label: "Notifications",
        icon: <Bell className="w-5 h-5" />,
        description: "Configure notification preferences",
    },
    {
        id: "security",
        label: "Security",
        icon: <Lock className="w-5 h-5" />,
        description: "Password and security settings",
    },
    {
        id: "appearance",
        label: "Appearance",
        icon: <Palette className="w-5 h-5" />,
        description: "Customize the look and feel",
    },
    {
        id: "language",
        label: "Language & Region",
        icon: <Globe className="w-5 h-5" />,
        description: "Set your language and timezone",
    },
    {
        id: "billing",
        label: "Billing",
        icon: <CreditCard className="w-5 h-5" />,
        description: "Manage subscription and payments",
    },
];

const DEFAULT_SETTINGS = {
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    projectUpdates: true,
    blueprintAlerts: true,
    weeklyDigest: false,
    // Security
    twoFactorAuth: false,
    sessionTimeout: "30",
    // Appearance
    theme: "system",
    compactMode: false,
    // Language
    language: "en",
    timezone: "UTC+5:30",
    dateFormat: "DD/MM/YYYY",
};

const Settings: React.FC = () => {
    const [activeSection, setActiveSection] = useState("notifications");
    const [isSaving, setIsSaving] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);

    // Load settings from localStorage on mount
    useEffect(() => {
        const savedSettings = localStorage.getItem("bidready_settings");
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setSettings({ ...DEFAULT_SETTINGS, ...parsed });
            } catch (e) {
                console.error("Failed to parse settings:", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Apply theme when settings change
    useEffect(() => {
        if (!isLoaded) return;

        const applyTheme = (theme: string) => {
            const root = document.documentElement;
            if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
                root.classList.add("dark");
            } else {
                root.classList.remove("dark");
            }
        };

        applyTheme(settings.theme);

        // Listen for system theme changes
        if (settings.theme === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handler = () => applyTheme("system");
            mediaQuery.addEventListener("change", handler);
            return () => mediaQuery.removeEventListener("change", handler);
        }
    }, [settings.theme, isLoaded]);

    // Apply compact mode
    useEffect(() => {
        if (!isLoaded) return;
        const root = document.documentElement;
        if (settings.compactMode) {
            root.classList.add("compact");
        } else {
            root.classList.remove("compact");
        }
    }, [settings.compactMode, isLoaded]);

    const handleToggle = (key: keyof typeof settings) => {
        const newSettings = {
            ...settings,
            [key]: !settings[key],
        };
        setSettings(newSettings);
        // Auto-save toggles immediately
        localStorage.setItem("bidready_settings", JSON.stringify(newSettings));
    };

    const handleChange = (key: keyof typeof settings, value: string) => {
        const newSettings = {
            ...settings,
            [key]: value,
        };
        setSettings(newSettings);
        // Auto-save changes immediately
        localStorage.setItem("bidready_settings", JSON.stringify(newSettings));
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Save to localStorage
        localStorage.setItem("bidready_settings", JSON.stringify(settings));
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsSaving(false);
        toast.success("Settings saved successfully!");
    };

    const renderNotificationsSection = () => (
        <div className="space-y-4">
            {[
                { key: "emailNotifications", label: "Email Notifications", desc: "Receive notifications via email" },
                { key: "pushNotifications", label: "Push Notifications", desc: "Browser push notifications" },
                { key: "projectUpdates", label: "Project Updates", desc: "Get notified about project changes" },
                { key: "blueprintAlerts", label: "Blueprint Alerts", desc: "Alerts for blueprint processing" },
                { key: "weeklyDigest", label: "Weekly Digest", desc: "Weekly summary of activities" },
            ].map((item) => (
                <div
                    key={item.key}
                    className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors"
                >
                    <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <button
                        onClick={() => handleToggle(item.key as keyof typeof settings)}
                        className={`relative w-12 h-7 rounded-full transition-colors ${settings[item.key as keyof typeof settings]
                            ? "bg-gradient-to-r from-primary to-orange-500"
                            : "bg-gray-300"
                            }`}
                    >
                        <span
                            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[item.key as keyof typeof settings] ? "translate-x-5" : ""
                                }`}
                        />
                    </button>
                </div>
            ))}
        </div>
    );

    const renderSecuritySection = () => (
        <div className="space-y-6">
            <div className="p-4 bg-gray-50/50 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                    <button
                        onClick={() => handleToggle("twoFactorAuth")}
                        className={`relative w-12 h-7 rounded-full transition-colors ${settings.twoFactorAuth
                            ? "bg-gradient-to-r from-primary to-orange-500"
                            : "bg-gray-300"
                            }`}
                    >
                        <span
                            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.twoFactorAuth ? "translate-x-5" : ""
                                }`}
                        />
                    </button>
                </div>
                {settings.twoFactorAuth && (
                    <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                        <Shield className="w-4 h-4" />
                        Two-factor authentication is enabled
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                </label>
                <select
                    value={settings.sessionTimeout}
                    onChange={(e) => handleChange("sessionTimeout", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all cursor-pointer"
                >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                </select>
            </div>

            <button className="w-full px-4 py-3 text-red-600 bg-red-50 rounded-xl font-medium hover:bg-red-100 transition-colors">
                Change Password
            </button>
        </div>
    );

    const renderAppearanceSection = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { value: "light", label: "Light", icon: <Sun className="w-5 h-5" /> },
                        { value: "dark", label: "Dark", icon: <Moon className="w-5 h-5" /> },
                        { value: "system", label: "System", icon: <Monitor className="w-5 h-5" /> },
                    ].map((theme) => (
                        <button
                            key={theme.value}
                            onClick={() => handleChange("theme", theme.value)}
                            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${settings.theme === theme.value
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-gray-100 hover:border-gray-200"
                                }`}
                        >
                            {theme.icon}
                            <span className="font-medium text-sm">{theme.label}</span>
                            {settings.theme === theme.value && <Check className="w-4 h-4" />}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
                <div>
                    <p className="font-medium text-gray-900">Compact Mode</p>
                    <p className="text-sm text-gray-500">Reduce spacing and padding</p>
                </div>
                <button
                    onClick={() => handleToggle("compactMode")}
                    className={`relative w-12 h-7 rounded-full transition-colors ${settings.compactMode
                        ? "bg-gradient-to-r from-primary to-orange-500"
                        : "bg-gray-300"
                        }`}
                >
                    <span
                        className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.compactMode ? "translate-x-5" : ""
                            }`}
                    />
                </button>
            </div>
        </div>
    );

    const renderLanguageSection = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                    value={settings.language}
                    onChange={(e) => handleChange("language", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all cursor-pointer"
                >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="hi">Hindi</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <select
                    value={settings.timezone}
                    onChange={(e) => handleChange("timezone", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all cursor-pointer"
                >
                    <option value="UTC-8">Pacific Time (UTC-8)</option>
                    <option value="UTC-5">Eastern Time (UTC-5)</option>
                    <option value="UTC+0">GMT (UTC+0)</option>
                    <option value="UTC+5:30">India (UTC+5:30)</option>
                    <option value="UTC+8">Singapore (UTC+8)</option>
                    <option value="UTC+9">Japan (UTC+9)</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                <select
                    value={settings.dateFormat}
                    onChange={(e) => handleChange("dateFormat", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all cursor-pointer"
                >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
            </div>
        </div>
    );

    const renderBillingSection = () => (
        <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-primary/10 to-orange-50 rounded-2xl border border-primary/20">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <span className="px-3 py-1 bg-gradient-to-r from-primary to-orange-500 text-white text-xs font-semibold rounded-full">
                            PRO PLAN
                        </span>
                        <h3 className="text-2xl font-bold text-gray-900 mt-2">$29/month</h3>
                    </div>
                    <Zap className="w-10 h-10 text-primary" />
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500" /> Unlimited Projects
                    </li>
                    <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500" /> 100GB Storage
                    </li>
                    <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500" /> Priority Support
                    </li>
                    <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500" /> AI-powered Detection
                    </li>
                </ul>
            </div>

            <div className="p-4 bg-gray-50/50 rounded-xl">
                <p className="text-sm text-gray-500 mb-2">Next billing date</p>
                <p className="font-semibold text-gray-900">February 28, 2026</p>
            </div>

            <div className="p-4 bg-gray-50/50 rounded-xl">
                <p className="text-sm text-gray-500 mb-2">Payment method</p>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
                        VISA
                    </div>
                    <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                </div>
            </div>

            <div className="flex gap-3">
                <button className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                    Cancel Plan
                </button>
                <button className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-orange-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary/30 transition-all">
                    Upgrade Plan
                </button>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case "notifications":
                return renderNotificationsSection();
            case "security":
                return renderSecuritySection();
            case "appearance":
                return renderAppearanceSection();
            case "language":
                return renderLanguageSection();
            case "billing":
                return renderBillingSection();
            default:
                return renderNotificationsSection();
        }
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-gradient-to-br from-primary/10 to-orange-100/50 rounded-xl">
                        <SettingsIcon className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                </div>
                <p className="text-gray-500 ml-[52px]">Manage your account preferences and settings</p>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 sticky top-8">
                        {settingSections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${activeSection === section.id
                                    ? "bg-gradient-to-r from-primary/10 to-orange-50 text-primary"
                                    : "hover:bg-gray-50 text-gray-600"
                                    }`}
                            >
                                {section.icon}
                                <div className="flex-1">
                                    <p className="font-medium">{section.label}</p>
                                </div>
                                <ChevronRight
                                    className={`w-4 h-4 transition-transform ${activeSection === section.id ? "rotate-90 text-primary" : ""
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {settingSections.find((s) => s.id === activeSection)?.label}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {settingSections.find((s) => s.id === activeSection)?.description}
                                </p>
                            </div>
                        </div>

                        {renderContent()}

                        {/* Save Button */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
