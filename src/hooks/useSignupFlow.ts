import { useCallback } from "react";
import { useSignupForm } from "./useSignupForm";
import { useFormValidation } from "./useFormValidation";
import { useFileUpload } from "./useFileUpload";
import { useStepper } from "./useStepper";
import { useSignup, UseSignupOptions } from "./useSignup";
import { useOtpVerification } from "./useOtpVerification";

const TOTAL_STEPS = 2;
const STEP_NAMES = ["User Details", "Company Info"];

export const useSignupFlow = (options?: UseSignupOptions) => {
  // Initialize all hooks
  const { formData, handleInputChange, resetForm } = useSignupForm();
  const { errors, validateStep, clearError, setSubmitError } = useFormValidation();
  const { profileFile, companyFile, handleFileSelect, resetFiles } = useFileUpload();
  const {
    currentStep,
    completedSteps,
    goToNextStep,
    goToPreviousStep,
    isFirstStep,
    isLastStep,
    resetStepper,
  } = useStepper(TOTAL_STEPS);
  
  // OTP verification hook
  const {
    isModalOpen: isOtpModalOpen,
    isVerifying: isOtpVerifying,
    otpError,
    email: otpEmail,
    openOtpModal,
    closeOtpModal,
    verifyOtp,
    resendOtp,
  } = useOtpVerification({
    onSuccess: async (otp) => {
      // After OTP verification, proceed with actual signup
      console.log("OTP verified successfully:", otp);
      const result = await submitSignup(formData, profileFile.file, companyFile.file);
      if (!result.success) {
        setSubmitError(result.error || "Signup failed after OTP verification");
      }
    },
    onError: (error) => {
      console.error("OTP verification failed:", error);
    },
    onResend: () => {
      console.log("OTP resent to:", formData.email);
    },
  });

  const { isLoading, showSuccess, submitSignup, handleSuccessClose } = useSignup({
    ...options,
    onError: (error) => {
      setSubmitError(error);
      options?.onError?.(error);
    },
  });

  // Enhanced input change handler that clears errors
  const handleInputChangeWithValidation = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    handleInputChange(e);
    
    // Clear error when user starts typing
    if (errors[name]) {
      clearError(name);
    }
  }, [handleInputChange, errors, clearError]);

  // Enhanced file select handler
  const handleFileSelectWithValidation = useCallback((
    file: File | null,
    type: 'profile' | 'company'
  ) => {
    handleFileSelect(file, type);
    
    // Clear file-related errors
    if (type === 'profile' && errors.profile_picture) {
      clearError('profile_picture');
    }
    if (type === 'company' && errors.company_logo) {
      clearError('company_logo');
    }
  }, [handleFileSelect, errors, clearError]);

  // Handle next step with validation
  const handleNext = useCallback(() => {
    if (validateStep(currentStep, formData)) {
      goToNextStep();
    }
  }, [currentStep, formData, validateStep, goToNextStep]);

  // Handle form submission - now triggers OTP verification first
  const handleSubmit = useCallback(async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault();
    }
    
    if (!validateStep(currentStep, formData)) {
      return;
    }
    
    // Open OTP modal instead of directly submitting
    openOtpModal(formData.email);
  }, [currentStep, formData, validateStep, openOtpModal]);

  // Reset entire form flow
  const resetAll = useCallback(() => {
    resetForm();
    resetFiles();
    resetStepper();
  }, [resetForm, resetFiles, resetStepper]);

  return {
    // Form data and handlers
    formData,
    handleInputChange: handleInputChangeWithValidation,
    
    // File upload
    profilePreview: profileFile.preview,
    logoPreview: companyFile.preview,
    handleFileSelect: handleFileSelectWithValidation,
    
    // Stepper
    currentStep,
    completedSteps,
    steps: STEP_NAMES,
    isFirstStep,
    isLastStep,
    handleNext,
    handlePrevious: goToPreviousStep,
    
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
    
    // Utilities
    resetAll,
  };
};
