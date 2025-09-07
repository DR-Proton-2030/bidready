"use client";

import AuthContextProvider from "@/contexts/authContext/Provider";
import CompanyContextProvider from "@/contexts/companyContext/Provider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <div id="main-provider">
      <ToastContainer position="top-right" autoClose={3000} />
      <AuthContextProvider>
        <CompanyContextProvider>
          <GoogleOAuthProvider
            clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
          >
            {children}
          </GoogleOAuthProvider>
        </CompanyContextProvider>
      </AuthContextProvider>
    </div>
  );
}
