"use client";
import { IInputProps } from "@/@types/props/input.props";
import useTooglePassword from "@/hooks/tooglePassword/useTooglePassword";
import { Eye, EyeOff } from "lucide-react";
import React from "react";

const PasswordInput: React.FC<IInputProps> = ({
  input,
  handleChange,
  value,
  placeholder
}) => {
  const { showPassword, handleTooglePasswordShow } = useTooglePassword();
  return (
    <div id={input.id} className="mt-3">
      <label className="text-gray-600 text-sm">{placeholder?? "Your Password" }</label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name={input.name}
          value={value}
          onChange={handleChange}
          placeholder="Password"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          type="button"
          className="absolute inset-y-0 right-3 flex items-center text-gray-500"
          onClick={handleTooglePasswordShow}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
