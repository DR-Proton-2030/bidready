"use client";
import React from "react";
import SignupForm from "./SignupForm";
import DashboardPreview from "@/components/shared/dashboardPreview/DashboardPreview";

const Signup: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Left side - Dashboard Preview */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 p-8 items-center justify-center">
        <div className="max-w-2xl w-full">
          <DashboardPreview />
        </div>
      </div>

      {/* Right side - Signup Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-8">
        <SignupForm />
      </div>
    </div>
  );
};

export default Signup;
