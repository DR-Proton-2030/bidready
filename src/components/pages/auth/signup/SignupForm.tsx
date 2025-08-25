"use client";
import React from "react";
import Link from "next/link";
import Stepper from "@/components/shared/stepper/Stepper";
import UserDetailsStep from "./steps/UserDetailsStep";
import PrimaryButton from "@/components/shared/buttons/primaryButton/PrimaryButton";
import CompanyLogo from "@/components/shared/companyLogo/CompanyLogo";
import SuccessAnimation from "@/components/shared/successAnimation/SuccessAnimation";
import CompanyDetailsStep from "./steps/CompanyDetailsStep";
import OtpVerificationModal from "@/components/shared/otpVerificationModal/OtpVerificationModal";
import { useSignupFlow } from "@/hooks";

const SignupForm: React.FC = () => {
  // Use the modularized signup flow hook
  const {
    // Form data and handlers
    formData,
    handleInputChange,
    
    // File upload
    profilePreview,
    logoPreview,
    handleFileSelect,
    
    // Stepper
    currentStep,
    completedSteps,
    steps,
    isFirstStep,
    isLastStep,
    handleNext,
    handlePrevious,
    
    // Validation
    errors,
    
    // Submission
    isLoading,
    showSuccess,
    handleSubmit,
    handleSuccessClose,
    
    // OTP Verification
    isOtpModalOpen,
    isOtpVerifying,
    otpError,
    otpEmail,
    closeOtpModal,
    verifyOtp,
    resendOtp,
  } = useSignupFlow();

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <UserDetailsStep
            formData={formData}
            profilePreview={profilePreview}
            errors={errors}
            onChange={handleInputChange}
            onFileSelect={(file: File | null) => handleFileSelect(file, 'profile')}
          />
        );
      case 2:
        return (
          <CompanyDetailsStep
            formData={formData}
            logoPreview={logoPreview}
            errors={errors}
            onChange={handleInputChange}
            onFileSelect={(file: File | null) => handleFileSelect(file, 'company')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-light-background flex items-center justify-center py-12 px-4 relative overflow-hidden">
      <div className="floating-elements absolute inset-0 pointer-events-none" />
      
      <div className="max-w-2xl w-full relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-6">
            <CompanyLogo width={120} />
          </div>
          <h1 className="text-3xl font-bold text-secondary mb-2">
            Join BidReady
          </h1>
          <p className="text-gray-600">
            Create your premium account and get started
          </p>
        </div>

        {/* Main Card */}
        <div className="signup-card p-8 mb-6 relative">
          {/* Premium Badge */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="premium-gradient text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
              ✨ Premium Experience
            </div>
          </div>

          {/* Stepper */}
          <Stepper
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
          />

          {/* Step Content */}
          <div className="mt-8 step-transition">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {!isFirstStep && (
              <button
                onClick={handlePrevious}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Previous
              </button>
            )}
            
            {!isLastStep ? (
              <PrimaryButton
                text="Next Step"
                className="flex-1"
                onClick={handleNext}
                icon={
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                }
              />
            ) : (
              <PrimaryButton
                text={isLoading ? "Creating Account..." : "Create Account"}
                className="flex-1"
                onClick={handleSubmit}
                disabled={isLoading}
                icon={
                  isLoading ? (
                    <div className="w-4 h-4 ml-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )
                }
              />
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center animate-fade-in">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:text-primary-hover">
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      {/* Success Animation */}
      <SuccessAnimation show={showSuccess} onClose={handleSuccessClose} />
      
      {/* OTP Verification Modal */}
      <OtpVerificationModal
        isOpen={isOtpModalOpen}
        onClose={closeOtpModal}
        onVerify={verifyOtp}
        isLoading={isOtpVerifying}
        email={otpEmail}
        error={otpError}
        onResendOtp={resendOtp}
      />
    </div>
  );
};

export default SignupForm;
