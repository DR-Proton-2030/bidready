"use client";
import React, { useState } from "react";
import EnhancedFileUpload from "@/components/shared/fileUpload/EnhancedFileUpload";
import PDFHandler from "@/components/shared/pdf/PDFHandler";
import PDFTester from "@/components/shared/fileUpload/PDFTester";
import { useFileProcessor } from "@/hooks/useFileProcessor";

interface ImageData {
  blob: Blob;
  name: string;
}

interface Props {
  version: string;
  type: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImagesProcessed?: (images: ImageData[]) => void;
  usePDFAnnotation?: boolean; // New prop to enable PDF annotation mode
}

const VersionTypeFileRowClient: React.FC<Props> = ({
  version,
  type,
  onChange,
  onFileChange,
  onImagesProcessed,
  usePDFAnnotation = false,
}) => {
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  
  const {
    processedImages,
    isProcessing,
    error,
    fileType,
    totalPages,
    processNewFile,
    removeImage,
    clearAll,
    usePDFHandler,
    setUsePDFHandler,
  } = useFileProcessor(10, usePDFAnnotation);

  const handleFileUpload = async (file: File | null) => {
    if (file) {
      setCurrentFile(file);
      
      // Create a fake event to maintain compatibility with existing interface
      const fakeEvent = {
        target: {
          files: [file],
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      onFileChange(fakeEvent);

      // If PDF annotation mode is enabled and file is PDF, don't process to images
      if (usePDFHandler && file.type === "application/pdf") {
        console.log("PDF file detected - using annotation mode");
        return;
      }

      try {
        const ret = await processNewFile(file);
        if (ret && onImagesProcessed) {
          const imageData = ret.blobs.map((blob, index) => ({
            blob,
            name: ret.names[index],
          }));
          // update parent immediately
          onImagesProcessed(imageData);
          console.log("=====>processedImages (returned)", imageData);
        }
      } catch (err) {
        console.error("Error processing file:", err);
      }
    }
  };

  const handlePDFExport = (exportData: { blob: Blob; fileName: string }) => {
    if (onImagesProcessed) {
      onImagesProcessed([{ blob: exportData.blob, name: exportData.fileName }]);
      console.log("=====>PDF exported", exportData.fileName);
    }
  };

  return (
    <div className="px-6 py-6">
      <div className="flex items-start justify-between gap-8 mb-6">
        <div className="flex-1">
          <p className="text-sm text-gray-500">Blueprint version and type.</p>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-4">
          <input
            name="version"
            type="text"
            value={version}
            onChange={onChange}
            className="w-full px-4 py-2 rounded border border-gray-200"
            placeholder="v1"
          />
          <input
            name="type"
            type="text"
            value={type}
            onChange={onChange}
            className="w-full px-4 py-2 rounded border border-gray-200"
            placeholder="floor_plan"
          />
        </div>
      </div>

      <div className="mt-2">
        <label className="block font-medium mb-1 mt-4">
          Upload Blueprint Files
        </label>
        <p className="text-sm text-gray-500 mb-4">
          {usePDFHandler
            ? "Upload and annotate blueprint PDF files with drawing tools, text, and shapes."
            : "Upload blueprint images or PDF files. PDF files will be converted to individual page images."}
        </p>

        {/* Toggle for PDF mode (optional) */}
        {!usePDFAnnotation && fileType === "pdf" && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={usePDFHandler}
                onChange={(e) => setUsePDFHandler(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-blue-900">
                Enable PDF Annotation Mode (Draw, mark, and edit PDF pages)
              </span>
            </label>
          </div>
        )}

        {/* Show PDF Handler or regular file upload based on mode */}
        {usePDFHandler && currentFile?.type === "application/pdf" ? (
          <PDFHandler
            file={currentFile}
            onPagesChange={handlePDFExport}
            onError={(err) => console.error("PDF Handler error:", err)}
          />
        ) : (
          <EnhancedFileUpload
            onChange={handleFileUpload}
            processedImages={processedImages}
            isProcessing={isProcessing}
            error={error}
            fileType={fileType}
            totalPages={totalPages}
            onRemoveImage={removeImage}
            onClearAll={clearAll}
          />
        )}
      </div>
    </div>
  );
};

export default VersionTypeFileRowClient;
