/* eslint-disable @typescript-eslint/no-explicit-any */
import { Payload } from "@/@types/api/api.types";
import { get, post, patch, del } from "../apiMethod";

const initialRoute = "auth";
export const signupUser = async (payload: FormData): Promise<any> => {
  try {
    const response = await post(`/${initialRoute}/signup`, payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Signup failed");
  }
};

export const loginUser = async (payload: object): Promise<any> => {
  try {
    const response = await post(`/${initialRoute}/login`, payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

export const verifyToken = async (): Promise<any> => {
  try {
    const response = await post("/auth/verify-token", {});
    return response.data;
  } catch (error: any) {
    console.error("Error verifying token:", error);
    throw new Error(
      error.response?.data?.message || "Token verification failed"
    );
  }
};

export const getOtp = async (payload: Payload) => {
  try {
    const data = await post(`/${initialRoute}/get-otp`, payload);
    console.log("OTP API response:", data);

    const { result: otp, userId, message } = data || {};

    if (otp) {
      return { otp, userId };
    }

    throw new Error(message || "OTP result not found");
  } catch (error: any) {
    console.error("OTP Error:", error);
    throw error;
  }
};

export const googleLogin = async (payload: any) => {
  try {
    const response = await post(`/${initialRoute}/google-login`, payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

export const createUsers = async (payload: FormData): Promise<any> => {
  try {
    const token = localStorage.getItem("@token");
    if (!token) {
      throw new Error("Token not found");
    }
    const response = await post(`/${initialRoute}/create-user`, payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "User Add failed");
  }
};

export const getUsers = async (filter: any): Promise<any> => {
  try {
    const token = localStorage.getItem("@token");
    if (!token) {
      throw new Error("Token not found");
    }

    const response = await get(
      `/${initialRoute}/get-user`,
      filter, // empty filter if you don’t need any
      token
    );

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Client List Get failed");
  }
};

export const logoutUser = async (): Promise<any> => {
  try {
    const response = await post("/auth/logout", {});
    return response.data;
  } catch (error: any) {
    console.error("Error logging out:", error);
    throw new Error(error.response?.data?.message || "Logout failed");
  }
};

export const getProfile = async (): Promise<any> => {
  try {
    const response = await get(`/${initialRoute}/profile`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch profile");
  }
};

export const updateProfile = async (payload: any): Promise<any> => {
  try {
    const response = await patch(`/${initialRoute}/update-profile`, payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update profile");
  }
};

export const updateUser = async (userId: string, payload: any): Promise<any> => {
  try {
    const token = localStorage.getItem("@token");
    const response = await patch(`/${initialRoute}/update-user/${userId}`, payload, token || undefined);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update user");
  }
};

export const deleteUser = async (userId: string): Promise<any> => {
  try {
    const token = localStorage.getItem("@token");
    const response = await del(`/${initialRoute}/delete-user/${userId}`, token || undefined);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete user");
  }
};
