"use client";
import React, { useState } from "react";
import PDFHandler from "@/components/shared/pdf/PDFHandler";
import { Upload } from "lucide-react";

export default function PDFAnnotationDemo() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      alert("Please select a PDF file");
    }
  };

  const handleExport = (exportData: { blob: Blob; fileName: string }) => {
    // Download the annotated PDF
    const url = URL.createObjectURL(exportData.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportData.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert(`PDF exported as: ${exportData.fileName}`);
  };

  const handleReset = () => {
    setPdfFile(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            PDF Annotation Tool Demo
          </h1>
          <p className="text-gray-600">
            Upload a PDF file and use the annotation tools to draw, highlight, add text, shapes, and more!
          </p>
        </div>

        {/* File Upload Section */}
        {!pdfFile && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <label
              htmlFor="pdf-upload"
              className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <Upload size={64} className="text-gray-400 mb-4" />
              <span className="text-lg font-medium text-gray-700 mb-2">
                Click to upload PDF file
              </span>
              <span className="text-sm text-gray-500">
                or drag and drop your PDF here
              </span>
              <input
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Features:</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Draw freehand with pen tool</li>
                <li>Highlight important sections</li>
                <li>Add text annotations</li>
                <li>Insert shapes (rectangles, circles, arrows, lines)</li>
                <li>Rotate, delete, and reorder pages</li>
                <li>Zoom in/out and pan</li>
                <li>Undo/Redo changes</li>
                <li>Export annotated PDF</li>
              </ul>
            </div>
          </div>
        )}

        {/* PDF Handler */}
        {pdfFile && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {pdfFile.name}
                </h2>
                <p className="text-sm text-gray-600">
                  Size: {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Upload New PDF
              </button>
            </div>
            
            <PDFHandler
              file={pdfFile}
              onPagesChange={handleExport}
              onError={(err) => {
                console.error("PDF Error:", err);
                alert(`Error: ${err}`);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
