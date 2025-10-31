"use client";
import React from "react";

interface Props {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TitleField: React.FC<Props> = ({ value, onChange }) => (
  <div className="flex items-start justify-between px-6 py-6 gap-8">
    <div className="flex-1">
      <label className="block font-medium mb-1">Blueprint title</label>
      <p className="text-sm text-gray-500">
        Enter the name of your blueprint. This will be your primary identifier.
      </p>
    </div>
    <div className="flex-1">
      <input
        name="name"
        type="text"
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="e.g. Downtown Office"
        required
      />
    </div>
  </div>
);

export default TitleField;
