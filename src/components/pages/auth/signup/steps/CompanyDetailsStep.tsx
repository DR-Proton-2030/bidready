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

const FEATURES = [
  { icon: "📊", title: "Advanced Analytics", desc: "Real-time insights & reporting" },
  { icon: "👥", title: "Team Collaboration", desc: "Unlimited team members" },
  { icon: "🛡️", title: "Priority Support", desc: "24/7 dedicated support" },
  { icon: "🔌", title: "Custom Integrations", desc: "API access & integrations" },
];

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
    <div className="space-y-4">
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
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors[input.name]}
              </p>
            )}
          </div>
        ))}
      </div>

   

      {/* Terms and Conditions */}
      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
        <input
          type="checkbox"
          id="terms"
          className="mt-0.5 h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 accent-orange-500"
          required
        />
        <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed">
          I agree to the{" "}
          <a href="/terms" className="text-orange-600 font-medium hover:text-orange-700 transition-colors">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-orange-600 font-medium hover:text-orange-700 transition-colors">
            Privacy Policy
          </a>
        </label>
      </div>
    </div>
  );
};

export default CompanyDetailsStep;
