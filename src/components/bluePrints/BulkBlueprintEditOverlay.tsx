"use client";

import React, { useEffect, useRef } from "react";
import PDFViewerSection from "@/components/pages/blueprintProcessing/PDFViewerSection";
import { usePDFAnnotation } from "@/hooks/usePDFAnnotation";

interface BulkBlueprintEditOverlayProps {
  file: File;
  blueprintId: string;
  name: string;
  onDone: () => void;
}

export default function BulkBlueprintEditOverlay({
  file,
  blueprintId,
  name,
  onDone,
}: BulkBlueprintEditOverlayProps) {
  const pdfAnnotationHook = usePDFAnnotation();
  const { loadPDF } = pdfAnnotationHook;
  // Guards against React Strict Mode's dev-only double-invoke of this effect,
  // which would otherwise call loadPDF(file) twice for the same session.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    // Load the local file directly (canvas-rendered, no network fetch) so this
    // never hits the "Error Loading PDF - Failed to fetch" issue that occurs
    // when loading pages from a remote/S3 URL instead.
    loadPDF(file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PDFViewerSection
      pdfFile={file}
      blueprintName={name}
      blueprintId={blueprintId}
      isProcessing={false}
      externalPDFHook={pdfAnnotationHook}
      onBack={onDone}
      onExportComplete={() => {}}
      onError={() => {}}
    />
  );
}
