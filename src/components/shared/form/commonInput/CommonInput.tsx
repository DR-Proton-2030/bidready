"use client";
import { IInputProps } from "@/@types/props/input.props";
import React from "react";

const CommonInput: React.FC<IInputProps> = ({ input, handleChange, value }) => {
  return (
    <div id={input.id} className="mb-3">
      <label className="text-gray-600 text-sm">{input.label}</label>
      <div className="relative">
        <input
          type={input.type}
          value={value}
          placeholder={input.placeHolder}
          name={input.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
        />
      </div>
    </div>
  );
};

export default CommonInput;
