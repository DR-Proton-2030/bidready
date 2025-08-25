"use client";
import React from "react";
import { ISignupFormData } from "@/@types/interface/signup.interface";
import CommonInput from "@/components/shared/form/commonInput/CommonInput";
import FileUpload from "@/components/shared/fileUpload/FileUpload";
import { IInput } from "@/@types/interface/input.interface";

interface CompanyDetailsStepProps {
  formData: ISignupFormData;
  logoPreview: string;
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onFileSelect: (file: File | null) => void;
}

const CompanyDetailsStep: React.FC<CompanyDetailsStepProps> = ({
  formData,
  logoPreview,
  errors,
  onChange,
  onFileSelect,
}) => {
  const inputFields: IInput[] = [
    {
      label: "Company Name",
      type: "text",
      name: "company_name",
      placeHolder: "Enter your company name",
      isRequired: true,
    },
    {
      label: "Company Website",
      type: "url",
      name: "website",
      placeHolder: "https://www.yourcompany.com",
      isRequired: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-secondary mb-2">
          Company Information
        </h2>
        <p className="text-gray-600">
          Tell us about your company
        </p>
      </div>

      {/* Company Logo Upload */}
      <FileUpload
        label="Company Logo"
        accept="image/*"
        placeholder="Click to upload or drag and drop your company logo"
        onFileSelect={onFileSelect}
        preview={logoPreview}
        error={errors.company_logo}
      />

      {/* Company Info Fields */}
      <div className="space-y-4">
        {inputFields.map((input, index) => (
          <div key={index}>
            <CommonInput
              input={input}
              value={formData[input.name as keyof ISignupFormData] as string}
              handleChange={onChange}
            />
            {errors[input.name] && (
              <p className="mt-1 text-sm text-red-600">{errors[input.name]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Company Features */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-orange-800 mb-4">
          🚀 What you'll get with BidReady Premium
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h5 className="font-medium text-orange-800">Advanced Analytics</h5>
              <p className="text-sm text-orange-700">Real-time insights and reporting</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h5 className="font-medium text-orange-800">Team Collaboration</h5>
              <p className="text-sm text-orange-700">Unlimited team members</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h5 className="font-medium text-orange-800">Priority Support</h5>
              <p className="text-sm text-orange-700">24/7 dedicated support</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h5 className="font-medium text-orange-800">Custom Integrations</h5>
              <p className="text-sm text-orange-700">API access and integrations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="terms"
            className="mt-1 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
            required
          />
          <label htmlFor="terms" className="text-sm text-gray-700">
            I agree to the{" "}
            <a href="/terms" className="text-primary hover:text-primary-hover font-medium">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-primary hover:text-primary-hover font-medium">
              Privacy Policy
            </a>
          </label>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailsStep;
