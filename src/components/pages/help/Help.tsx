"use client";

import React, { useState } from "react";
import {
    HelpCircle,
    Search,
    Book,
    MessageCircle,
    FileText,
    Video,
    Mail,
    Phone,
    ChevronDown,
    ChevronRight,
    ExternalLink,
    Lightbulb,
    Zap,
    FolderOpen,
    FileImage,
    Users,
    Shield,
    Send,
    Loader2,
} from "lucide-react";
import { toast } from "react-toastify";

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const faqs: FAQItem[] = [
    {
        category: "Getting Started",
        question: "How do I create my first project?",
        answer:
            "To create a project, click on 'Projects' in the sidebar, then click the 'Create New Project' button. Fill in the project details including title, description, and scope, then click 'Create Project'.",
    },
    {
        category: "Getting Started",
        question: "What file formats are supported for blueprints?",
        answer:
            "BidReady supports PDF, DWG, and various image formats (PNG, JPG, TIFF) for blueprint uploads. PDFs are automatically converted to individual page images for processing.",
    },
    {
        category: "Blueprints",
        question: "How does the AI detection work?",
        answer:
            "Our AI detection uses advanced computer vision to identify and classify elements in your blueprints such as walls, windows, doors, electrical fixtures, and plumbing. The system automatically generates quantity takeoffs based on detected elements.",
    },
    {
        category: "Blueprints",
        question: "Can I edit the AI detection results?",
        answer:
            "Yes! You can manually adjust detection results using our overlay editor. Simply click on any detected element to modify, delete, or add new annotations.",
    },
    {
        category: "Projects",
        question: "How do I share a project with team members?",
        answer:
            "Go to Access Management in the sidebar to invite team members. You can assign different roles (Admin, Editor, Viewer) to control what actions each member can perform.",
    },
    {
        category: "Projects",
        question: "Can I export my quantity takeoff data?",
        answer:
            "Yes, you can export your data in CSV or PDF format. Go to the blueprint details page and click the 'Download CSV' button to export the quantity data.",
    },
    {
        category: "Billing",
        question: "What payment methods do you accept?",
        answer:
            "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise accounts.",
    },
    {
        category: "Billing",
        question: "Can I upgrade or downgrade my plan?",
        answer:
            "Yes, you can change your plan at any time from Settings > Billing. Changes take effect immediately, and we'll prorate any charges or credits.",
    },
];

const helpCategories = [
    {
        id: "getting-started",
        title: "Getting Started",
        description: "Learn the basics of BidReady",
        icon: <Lightbulb className="w-6 h-6" />,
        articles: 12,
    },
    {
        id: "projects",
        title: "Projects",
        description: "Creating and managing projects",
        icon: <FolderOpen className="w-6 h-6" />,
        articles: 8,
    },
    {
        id: "blueprints",
        title: "Blueprints",
        description: "Upload and process blueprints",
        icon: <FileImage className="w-6 h-6" />,
        articles: 15,
    },
    {
        id: "team",
        title: "Team & Access",
        description: "Manage team members and permissions",
        icon: <Users className="w-6 h-6" />,
        articles: 6,
    },
    {
        id: "security",
        title: "Security",
        description: "Account security and privacy",
        icon: <Shield className="w-6 h-6" />,
        articles: 5,
    },
    {
        id: "billing",
        title: "Billing",
        description: "Plans, payments, and invoices",
        icon: <Zap className="w-6 h-6" />,
        articles: 7,
    },
];

const Help: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
    const [contactForm, setContactForm] = useState({
        subject: "",
        message: "",
    });
    const [isSending, setIsSending] = useState(false);

    const filteredFAQs = faqs.filter(
        (faq) =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSendMessage = async () => {
        if (!contactForm.subject || !contactForm.message) {
            toast.error("Please fill in all fields");
            return;
        }
        setIsSending(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsSending(false);
        toast.success("Message sent! We'll get back to you soon.");
        setContactForm({ subject: "", message: "" });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-8">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-primary/10 to-orange-100/50 rounded-2xl mb-4">
                    <HelpCircle className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">How can we help?</h1>
                <p className="text-gray-500 max-w-lg mx-auto">
                    Search our knowledge base or browse categories to find the answers you need
                </p>

                {/* Search Bar */}
                <div className="relative max-w-2xl mx-auto mt-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search for help articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-lg"
                    />
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
                {[
                    { icon: <Book className="w-5 h-5" />, label: "Documentation", href: "#" },
                    { icon: <Video className="w-5 h-5" />, label: "Video Tutorials", href: "#" },
                    { icon: <MessageCircle className="w-5 h-5" />, label: "Live Chat", href: "#" },
                ].map((link, idx) => (
                    <a
                        key={idx}
                        href={link.href}
                        className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group"
                    >
                        <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            {link.icon}
                        </div>
                        <span className="font-medium text-gray-900">{link.label}</span>
                        <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                    </a>
                ))}
            </div>

            {/* Help Categories */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Browse by Category</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                    {helpCategories.map((category) => (
                        <div
                            key={category.id}
                            className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-gradient-to-br from-primary/10 to-orange-50 rounded-xl text-primary group-hover:scale-110 transition-transform">
                                    {category.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                                        {category.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-2">{category.description}</p>
                                    <span className="text-xs text-primary font-medium">
                                        {category.articles} articles
                                    </span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQ Section */}
            <div className="max-w-3xl mx-auto mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Frequently Asked Questions
                </h2>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {filteredFAQs.map((faq, index) => (
                        <div key={index} className="border-b border-gray-100 last:border-0">
                            <button
                                onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                        {faq.category}
                                    </span>
                                    <span className="font-medium text-gray-900">{faq.question}</span>
                                </div>
                                <ChevronDown
                                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedFAQ === index ? "rotate-180" : ""
                                        }`}
                                />
                            </button>
                            {expandedFAQ === index && (
                                <div className="px-5 pb-5 text-gray-600 leading-relaxed animate-fadeIn">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact Section */}
            <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Still need help?
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Contact Info */}
                    <div className="bg-gradient-to-br from-primary to-orange-500 rounded-2xl p-8 text-white">
                        <h3 className="text-xl font-bold mb-4">Contact Support</h3>
                        <p className="opacity-90 mb-6">
                            Our support team is available to help you with any questions or issues.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm opacity-75">Email</p>
                                    <p className="font-medium">support@bidready.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm opacity-75">Phone</p>
                                    <p className="font-medium">+1 (555) 123-4567</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <MessageCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm opacity-75">Live Chat</p>
                                    <p className="font-medium">Available 24/7</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Send us a message</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    value={contactForm.subject}
                                    onChange={(e) =>
                                        setContactForm({ ...contactForm, subject: e.target.value })
                                    }
                                    placeholder="What do you need help with?"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Message
                                </label>
                                <textarea
                                    value={contactForm.message}
                                    onChange={(e) =>
                                        setContactForm({ ...contactForm, message: e.target.value })
                                    }
                                    placeholder="Describe your issue or question..."
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all resize-none"
                                />
                            </div>
                            <button
                                onClick={handleSendMessage}
                                disabled={isSending}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50"
                            >
                                {isSending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Send Message
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

export default Help;
