"use client";

import AuthContextProvider from "@/contexts/authContext/Provider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <div id="main-provider">
      <ToastContainer position="top-right" autoClose={3000} />
      <AuthContextProvider>{children}</AuthContextProvider>
    </div>
  );
}
