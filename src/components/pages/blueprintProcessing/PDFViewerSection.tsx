"use client";
import React, { useState, useEffect } from "react";
import PDFHandler from "@/components/shared/pdf/PDFHandler";
import { FileText, ArrowLeft, Download } from "lucide-react";

interface PDFViewerSectionProps {
  pdfFile: File | null;
  blueprintName: string;
  onBack: () => void;
  onExportComplete?: (exportData: { blob: Blob; fileName: string }) => void;
  onError?: (error: string) => void;
  externalPDFHook?: any; // External PDF annotation hook
}

const PDFViewerSection: React.FC<PDFViewerSectionProps> = ({
  pdfFile,
  blueprintName,
  onBack,
  onExportComplete,
  onError,
  externalPDFHook,
}) => {
  const [hasAnnotations, setHasAnnotations] = useState(false);

  const handlePDFExport = (exportData: { blob: Blob; fileName: string }) => {
    console.log("PDF exported:", exportData.fileName);
    setHasAnnotations(true);
    
    if (onExportComplete) {
      onExportComplete(exportData);
    }
    
    // Auto-download the annotated PDF
    const url = URL.createObjectURL(exportData.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportData.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleError = (error: string) => {
    console.error("PDF Handler error:", error);
    if (onError) {
      onError(error);
    }
  };

  if (!pdfFile) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No PDF File Available
        </h3>
        <p className="text-gray-600 mb-6">
          Please upload a PDF file to use the annotation tools.
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Upload
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {blueprintName}
              </h2>
              <p className="text-sm text-gray-600">
                PDF Annotation Mode - Draw, mark, and edit your blueprint
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {hasAnnotations && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <Download className="w-4 h-4 mr-1" />
                Annotations Saved
              </span>
            )}
            <button
              onClick={onBack}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Images
            </button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FileText className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              PDF Annotation Tools Available
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Draw with pen, highlighter, and shapes</li>
                <li>Add text annotations and comments</li>
                <li>Rotate, delete, or reorder pages</li>
                <li>Export annotated PDF when finished</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Handler Component */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-lg">
        <PDFHandler
          file={pdfFile}
          onPagesChange={handlePDFExport}
          onError={handleError}
          externalPDFHook={externalPDFHook}
        />
      </div>

      {/* Helper Text */}
      <div className="text-center text-sm text-gray-600">
        <p>
          Use the toolbar above to annotate your PDF. Click "Export" when done to save your changes.
        </p>
      </div>
    </div>
  );
};

export default PDFViewerSection;
