import { useState, useCallback } from "react";
import { ISignupFormData } from "@/@types/interface/signup.interface";

export const useSignupForm = () => {
  const [formData, setFormData] = useState<ISignupFormData>({
    // Step 1 - User Details
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    emp_id: "",
    
    // Step 2 - Company Details
    company_name: "",
    website: "",
    role: "",
  });

  const updateFormData = useCallback((
    field: keyof ISignupFormData,
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    updateFormData(name as keyof ISignupFormData, value);
  }, [updateFormData]);

  const resetForm = useCallback(() => {
    setFormData({
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
      emp_id: "",
      company_name: "",
      website: "",
      role: "",
    });
  }, []);

  const getFormDataForStep = useCallback((step: number) => {
    if (step === 1) {
      return {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        emp_id: formData.emp_id,
      };
    } else if (step === 2) {
      return {
        company_name: formData.company_name,
        website: formData.website,
        role: formData.role,
      };
    }
    return {};
  }, [formData]);

  return {
    formData,
    updateFormData,
    handleInputChange,
    resetForm,
    getFormDataForStep,
  };
};
