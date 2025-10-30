"use client";

import AuthContextProvider from "@/contexts/authContext/Provider";
import CompanyContextProvider from "@/contexts/companyContext/Provider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { configurePdfWorker } from "@/utils/pdfConfig";

export function Providers({ children }: { children: React.ReactNode }) {
  // Configure PDF.js worker on mount
  useEffect(() => {
    configurePdfWorker();
  }, []);

  return (
    <div id="main-provider">
      <ToastContainer position="top-right" autoClose={3000} />
      <AuthContextProvider>
        <CompanyContextProvider>
          <GoogleOAuthProvider
            clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "ss"}
          >
            {children}
          </GoogleOAuthProvider>
        </CompanyContextProvider>
      </AuthContextProvider>
    </div>
  );
}
