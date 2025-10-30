"use client";
import React, { useRef } from "react";
import { Upload, FileText } from "lucide-react";

interface PDFUploadButtonProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const PDFUploadButton: React.FC<PDFUploadButtonProps> = ({
  onFileSelect,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      onFileSelect(file);
    } else if (file) {
      alert("Please select a PDF file");
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      <button
        onClick={handleButtonClick}
        disabled={disabled}
        className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          disabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-purple-600 text-white hover:bg-purple-700"
        }`}
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload PDF for Annotation
      </button>
    </>
  );
};

export default PDFUploadButton;
