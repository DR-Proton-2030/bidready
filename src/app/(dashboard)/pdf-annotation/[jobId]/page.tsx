"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import PDFHandler from "@/components/shared/pdf/PDFHandler";
import { ArrowLeft, Download, ArrowRight } from "lucide-react";

export default function PDFAnnotationPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const jobId = params.jobId as string;

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    version: "v1",
    status: "active",
    type: "",
    project_object_id: "",
  });

  // Get form data from URL params
  useEffect(() => {
    const name = searchParams.get("name") || "";
    const description = searchParams.get("description") || "";
    const version = searchParams.get("version") || "v1";
    const status = searchParams.get("status") || "active";
    const type = searchParams.get("type") || "";
    const project_object_id = searchParams.get("project_object_id") || "";

    setFormData({
      name,
      description,
      version,
      status,
      type,
      project_object_id,
    });
  }, [searchParams]);

  // Load PDF file from job
  useEffect(() => {
    const loadPDFFromJob = async () => {
      try {
        setIsLoading(true);
        
        // Fetch the PDF file from the job
        const response = await fetch(`/api/blueprints/pdf-job/${jobId}`);
        
        if (!response.ok) {
          throw new Error("Failed to load PDF");
        }

        const blob = await response.blob();
        const file = new File([blob], `blueprint_${jobId}.pdf`, {
          type: "application/pdf",
        });

        setPdfFile(file);
      } catch (error) {
        console.error("Error loading PDF:", error);
        alert("Failed to load PDF file");
        router.push("/create-blueprint");
      } finally {
        setIsLoading(false);
      }
    };

    if (jobId) {
      loadPDFFromJob();
    }
  }, [jobId, router]);

  const handleExport = async (annotatedPdfBlob: Blob, pages: any[]) => {
    try {
      // Convert blob to file
      const annotatedFile = new File(
        [annotatedPdfBlob],
        `${formData.name || "blueprint"}_annotated.pdf`,
        { type: "application/pdf" }
      );

      // Create FormData with blueprint info and annotated PDF
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("description", formData.description);
      fd.append("version", formData.version);
      fd.append("status", formData.status);
      fd.append("type", formData.type);
      fd.append("project_object_id", formData.project_object_id);
      fd.append("pdf_file", annotatedFile);
      fd.append("page_count", String(pages.length));

      // Send to backend to create blueprint
      const response = await fetch("/api/blueprints/create-from-pdf", {
        method: "POST",
        body: fd,
      });

      if (!response.ok) {
        throw new Error("Failed to create blueprint");
      }

      const result = await response.json();
      
      // Navigate to blueprint details or list
      router.push("/blueprints");
    } catch (error) {
      console.error("Error creating blueprint from PDF:", error);
      alert("Failed to create blueprint. Please try again.");
    }
  };

  const handleBack = () => {
    router.push("/create-blueprint");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PDF...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <div className="border-l border-gray-300 h-6"></div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {formData.name || "Untitled Blueprint"}
                </h1>
                <p className="text-sm text-gray-500">
                  Annotate your PDF blueprint
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Annotation Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {pdfFile ? (
          <PDFHandler
            file={pdfFile}
            onExport={handleExport}
            showExportButton={true}
            exportButtonText="Save Blueprint"
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No PDF file found</p>
            <button
              onClick={handleBack}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Go back to upload
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
