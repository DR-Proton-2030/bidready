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
  withCredentials: true, // Enables cookies
});

// 🔹 Request interceptor (Add headers like Authorization if needed)
API.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// 🔹 Response interceptor (Handles global API errors)
API.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const message = error.response?.data?.message || "Something went wrong!";
    
    // Only show toast in client-side environment
    if (typeof window !== 'undefined') {
      // Dynamic import to avoid SSR issues
      import('react-toastify').then(({ toast }) => {
        toast.error(message);
      });
    }
    
    console.error("API Error:", message);
    return Promise.reject(error);
  }
);

export default API;
