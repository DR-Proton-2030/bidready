import { useState, useCallback } from "react";

export interface FileUploadState {
  file: File | null;
  preview: string;
}

export const useFileUpload = () => {
  const [profileFile, setProfileFile] = useState<FileUploadState>({
    file: null,
    preview: "",
  });
  
  const [companyFile, setCompanyFile] = useState<FileUploadState>({
    file: null,
    preview: "",
  });

  const handleFileSelect = useCallback((
    file: File | null, 
    type: 'profile' | 'company'
  ) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        
        if (type === 'profile') {
          setProfileFile({ file, preview: result });
        } else {
          setCompanyFile({ file, preview: result });
        }
      };
      reader.readAsDataURL(file);
    } else {
      if (type === 'profile') {
        setProfileFile({ file: null, preview: "" });
      } else {
        setCompanyFile({ file: null, preview: "" });
      }
    }
  }, []);

  const resetFiles = useCallback(() => {
    setProfileFile({ file: null, preview: "" });
    setCompanyFile({ file: null, preview: "" });
  }, []);

  return {
    profileFile,
    companyFile,
    handleFileSelect,
    resetFiles,
  };
};
