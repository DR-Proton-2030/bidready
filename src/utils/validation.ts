import { ValidationErrors } from "@/hooks";

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
  message?: string;
}

export interface ValidationSchema {
  [fieldName: string]: ValidationRule | ValidationRule[];
}

export const createValidator = (schema: ValidationSchema) => {
  return (data: Record<string, any>): ValidationErrors => {
    const errors: ValidationErrors = {};

    Object.entries(schema).forEach(([fieldName, rules]) => {
      const value = data[fieldName] || "";
      const ruleArray = Array.isArray(rules) ? rules : [rules];

      for (const rule of ruleArray) {
        const error = validateField(value, rule, fieldName);
        if (error) {
          errors[fieldName] = error;
          break; // Stop at first error for this field
        }
      }
    });

    return errors;
  };
};

const validateField = (value: string, rule: ValidationRule, fieldName: string): string | null => {
  // Required validation
  if (rule.required && !value.trim()) {
    return rule.message || `${formatFieldName(fieldName)} is required`;
  }

  // Skip other validations if field is empty and not required
  if (!value.trim() && !rule.required) {
    return null;
  }

  // Min length validation
  if (rule.minLength && value.length < rule.minLength) {
    return rule.message || `${formatFieldName(fieldName)} must be at least ${rule.minLength} characters`;
  }

  // Max length validation
  if (rule.maxLength && value.length > rule.maxLength) {
    return rule.message || `${formatFieldName(fieldName)} must be no more than ${rule.maxLength} characters`;
  }

  // Pattern validation
  if (rule.pattern && !rule.pattern.test(value)) {
    return rule.message || `${formatFieldName(fieldName)} format is invalid`;
  }

  // Custom validation
  if (rule.custom) {
    return rule.custom(value);
  }

  return null;
};

const formatFieldName = (fieldName: string): string => {
  return fieldName
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

// Common validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+\..+/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  noSpecialChars: /^[a-zA-Z0-9\s]+$/,
};

// Common validation rules
export const CommonRules = {
  required: { required: true },
  email: { 
    required: true, 
    pattern: ValidationPatterns.email, 
    message: "Please enter a valid email address" 
  },
  password: { 
    required: true, 
    minLength: 6, 
    message: "Password must be at least 6 characters long" 
  },
  url: { 
    required: true, 
    pattern: ValidationPatterns.url, 
    message: "Please enter a valid URL (e.g., https://example.com)" 
  },
};
