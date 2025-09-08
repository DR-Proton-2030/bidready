"use client";
import React from "react";
import EnhancedFileUpload from "@/components/shared/fileUpload/EnhancedFileUpload";
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
}

const VersionTypeFileRowClient: React.FC<Props> = ({
  version,
  type,
  onChange,
  onFileChange,
  onImagesProcessed,
}) => {
  const {
    processedImages,
    isProcessing,
    error,
    fileType,
    totalPages,
    processNewFile,
    removeImage,
    clearAll,
  } = useFileProcessor();

  const handleFileUpload = async (file: File | null) => {
    if (file) {
      // Create a fake event to maintain compatibility with existing interface
      const fakeEvent = {
        target: {
          files: [file],
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      onFileChange(fakeEvent);

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
          Upload blueprint images or PDF files. PDF files will be converted to
          individual page images.
        </p>

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
      </div>
    </div>
  );
};

export default VersionTypeFileRowClient;
