"use client";
import React from "react";
import { SIGNUP_FIELDS, SIGNUP_CONTENT, SOCIAL_LOGIN_OPTIONS } from "@/constants/auth/signup.constant";
import { useSignup } from "@/hooks/auth/useSignup";
import SocialLoginButton from "@/components/shared/socialLoginButton/SocialLoginButton";
import Link from "next/link";
import { Chrome, Linkedin, Apple } from "lucide-react";

const SignupForm: React.FC = () => {
  const {
    signupData,
    isLoading,
    errors,
    handleInputChange,
    handleSubmit,
    handleSocialLogin,
  } = useSignup();

  const getSocialIcon = (iconName: string) => {
    switch (iconName) {
      case "google":
        return <Chrome className="w-5 h-5 text-red-500" />;
      case "linkedin":
        return <Linkedin className="w-5 h-5 text-blue-600" />;
      case "apple":
        return <Apple className="w-5 h-5 text-gray-800" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm max-w-md w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {SIGNUP_CONTENT.title}
        </h1>
        <p className="text-gray-600 text-sm leading-relaxed">
          {SIGNUP_CONTENT.subtitle}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {SIGNUP_FIELDS.map((field) => (
          <div key={field.id} className="space-y-2">
            <label
              htmlFor={field.id}
              className="block text-sm font-medium text-gray-700"
            >
              {field.label}
            </label>
            <input
              type={field.type}
              id={field.id}
              placeholder={field.placeholder}
              required={field.required}
              value={signupData[field.id]}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200 ${
                errors[field.id]
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            />
            {errors[field.id] && (
              <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>
            )}
          </div>
        ))}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating account...</span>
            </div>
          ) : (
            SIGNUP_CONTENT.submitButtonText
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-gray-200"></div>
        <span className="px-4 text-gray-500 text-sm">{SIGNUP_CONTENT.orText}</span>
        <div className="flex-1 border-t border-gray-200"></div>
      </div>

      {/* Social Login */}
      <div className="flex items-center justify-center space-x-4">
        {SOCIAL_LOGIN_OPTIONS.map((option) => (
          <SocialLoginButton
            key={option.id}
            provider={option.id}
            icon={getSocialIcon(option.icon)}
            onClick={handleSocialLogin}
            className="hover:border-primary hover:shadow-sm"
          />
        ))}
      </div>

      {/* Alternative Link */}
      <div className="text-center mt-6">
        <p className="text-gray-600 text-sm">
          {SIGNUP_CONTENT.alternativeText}{" "}
          <Link
            href="/login"
            className="text-primary hover:text-primary-hover font-medium transition-colors duration-200"
          >
            {SIGNUP_CONTENT.alternativeLink}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
