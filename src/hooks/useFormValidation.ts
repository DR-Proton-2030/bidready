import { useState, useCallback } from "react";
import { ISignupFormData } from "@/@types/interface/signup.interface";
import { createValidator, ValidationSchema, CommonRules } from "@/utils/validation";

export interface ValidationErrors {
  [key: string]: string;
}

// Define validation schema for signup form
const signupValidationSchema: ValidationSchema = {
  // Step 1 validations
  full_name: { required: true, minLength: 2, maxLength: 50 },
  email: CommonRules.email,
  emp_id: { required: true, minLength: 2, maxLength: 20 },
  password: CommonRules.password,
  confirmPassword: { 
    required: true,
    custom: (value: string, formData?: any) => {
      if (formData && value !== formData.password) {
        return "Passwords do not match";
      }
      return null;
    }
  },
  
  // Step 2 validations
  company_name: { required: true, minLength: 2, maxLength: 100 },
  website: CommonRules.url,
  role: { required: true, minLength: 2, maxLength: 50 },
};

export const useFormValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const clearError = useCallback((fieldName: string) => {
    setErrors(prev => ({ ...prev, [fieldName]: "" }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const validateStep = useCallback((step: number, formData: ISignupFormData): boolean => {
    const fieldsToValidate = step === 1 
      ? ['full_name', 'email', 'password', 'confirmPassword']
      : ['company_name', 'website'];

    const stepSchema: ValidationSchema = {};
    fieldsToValidate.forEach(field => {
      if (signupValidationSchema[field]) {
        stepSchema[field] = signupValidationSchema[field];
      }
    });

    // Create validator for this step
    const validator = createValidator(stepSchema);
    
    // Special handling for confirm password
    const formDataWithPasswordMatch = { 
      ...formData,
      confirmPassword: formData.confirmPassword
    };

    // Custom validation for confirm password
    const stepErrors: ValidationErrors = {};
    
    // Run standard validations
    const standardErrors = validator(formDataWithPasswordMatch);
    Object.assign(stepErrors, standardErrors);
    
    // Custom confirm password validation
    if (step === 1 && formData.confirmPassword !== formData.password) {
      stepErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }, []);

  const validateField = useCallback((fieldName: string, value: string, formData?: ISignupFormData): string | null => {
    const rule = signupValidationSchema[fieldName];
    if (!rule) return null;

    const validator = createValidator({ [fieldName]: rule });
    const fieldErrors = validator({ [fieldName]: value, ...formData });
    
    return fieldErrors[fieldName] || null;
  }, []);

  const setSubmitError = useCallback((message: string) => {
    setErrors(prev => ({ ...prev, submit: message }));
  }, []);

  const setFieldError = useCallback((fieldName: string, message: string) => {
    setErrors(prev => ({ ...prev, [fieldName]: message }));
  }, []);

  return {
    errors,
    validateStep,
    validateField,
    clearError,
    clearAllErrors,
    setSubmitError,
    setFieldError,
  };
};
