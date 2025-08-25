"use client";
import React from "react";
import { ISignupFormData } from "@/@types/interface/signup.interface";
import CommonInput from "@/components/shared/form/commonInput/CommonInput";
import PasswordInput from "@/components/shared/form/passwordInput/PasswordInput";
import FileUpload from "@/components/shared/fileUpload/FileUpload";
import { IInput } from "@/@types/interface/input.interface";

interface UserDetailsStepProps {
  formData: ISignupFormData;
  profilePreview: string;
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onFileSelect: (file: File | null) => void;
}

const UserDetailsStep: React.FC<UserDetailsStepProps> = ({
  formData,
  profilePreview,
  errors,
  onChange,
  onFileSelect,
}) => {
  const inputFields: IInput[] = [
    {
      label: "Full Name",
      type: "text",
      name: "full_name",
      placeHolder: "Enter your full name",
      isRequired: true,
    },
    {
      label: "Email Address",
      type: "email",
      name: "email",
      placeHolder: "Enter your email address",
      isRequired: true,
    },
  ];

  const passwordFields: IInput[] = [
    {
      label: "Password",
      type: "password",
      name: "password",
      placeHolder: "Create a strong password",
      isRequired: true,
    },
    {
      label: "Confirm Password",
      type: "password",
      name: "confirmPassword",
      placeHolder: "Confirm your password",
      isRequired: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-secondary mb-2">
          Create Your Account
        </h2>
        <p className="text-gray-600">
          Let's start with your basic information
        </p>
      </div>

      {/* Profile Picture Upload */}
      <FileUpload
        label="Profile Picture"
        accept="image/*"
        placeholder="Click to upload or drag and drop your profile picture"
        onFileSelect={onFileSelect}
        preview={profilePreview}
        error={errors.profile_picture}
      />

      {/* Basic Info Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {inputFields.map((input, index) => (
          <div key={index} className={input.name === 'full_name' || input.name === 'email' ? 'md:col-span-2' : ''}>
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

      {/* Password Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {passwordFields.map((input, index) => (
          <div key={index}>
            <PasswordInput
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

      {/* Password Requirements */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          Password Requirements:
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            At least 6 characters long
          </li>
          <li className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Mix of letters and numbers recommended
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserDetailsStep;
