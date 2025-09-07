"use client";
import React, { useState } from "react";
import { testPDFProcessing } from "@/utils/fileProcessing/testPDF";

const PDFTester: React.FC = () => {
  const [result, setResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileTest = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setResult("Testing PDF...");

    try {
      const testResult = await testPDFProcessing(file);
      if (testResult.success) {
        setResult(`✅ PDF test successful! Pages: ${testResult.pageCount}`);
      } else {
        setResult(`❌ PDF test failed: ${testResult.error}`);
      }
    } catch (error) {
      setResult(
        `❌ Test error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border rounded p-4 mt-4 bg-gray-50">
      <h3 className="font-medium mb-2">PDF Processing Test</h3>
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileTest}
        className="mb-2"
      />
      {isLoading && <p className="text-blue-600">Testing...</p>}
      {result && (
        <p
          className={result.includes("✅") ? "text-green-600" : "text-red-600"}
        >
          {result}
        </p>
      )}
    </div>
  );
};

export default PDFTester;
