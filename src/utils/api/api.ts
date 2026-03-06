// utils/api.ts
import { ApiErrorResponse } from "@/@types/api/apiError.interface";
import { headers } from "@/config/config";
import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";

const API: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers,
  // Only use credentials if we are on the same domain or explicitly needed.
  // For Bearer auth, this is usually not needed and can cause cookie domain errors.
  withCredentials: false, 
});

// 🔹 Request interceptor (Add Authorization header)
API.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("@token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// 🔹 Response interceptor (Handles global API errors)
API.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || "Something went wrong!";

    if (status === 401 || status === 403) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("@token");
        // Clear cookie with both domain and path to be sure
        const domain = window.location.hostname.includes("bidready.net") ? ".bidready.net" : "localhost";
        document.cookie = `token=; path=/; domain=${domain}; max-age=0; SameSite=Lax`;
        document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
        
        // Use window.location.replace to prevent back button issues
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    if (typeof window !== "undefined") {
      import("react-toastify").then(({ toast }) => {
        toast.error(message);
      });
    }

    console.error("API Error:", message);
    return Promise.reject(error);
  }
);

export default API;
