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
    <div className="space-y-4">
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

      {/* Password Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {passwordFields.map((input, index) => (
          <div key={index}>
            <PasswordInput
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

   
    </div>
  );
};

export default UserDetailsStep;
