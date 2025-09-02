"use client";
import initialState from "./store";
import actions from "./actions";
import reducer from "./reducer";
import { useCallback, useEffect, useReducer, useState } from "react";
import AuthContext from "./authContext";
import { IUser } from "@/@types/interface/user.interface";
import { ContextProviderProps } from "@/@types/contexts/context.types";
import { api } from "@/utils/api";
import { ProtectedRoutes } from "@/constants/protectedRoutes/ProtectedRoutes";

const AuthContextProvider = ({ children }: ContextProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isOnProtectedRoute, setIsOnProtectedRoute] = useState<boolean>(false);

  const fetchUser = useCallback(async () => {
    try {
      if (!isOnProtectedRoute) return;
      const response = await api.auth.verifyToken();
      if (response) {
        console.log("==>", response);
        const { user } = response;
        dispatch({
          type: actions.SET_USER,
          payload: { ...state, user },
        });
      }
    } catch (error) {
      dispatch({ type: actions.SET_USER, payload: { ...state, user: null } });
    }
  }, [isOnProtectedRoute]);

  const setUser = useCallback((user: IUser | null) => {
    dispatch({ type: actions.SET_USER, payload: { ...state, user } });
  }, []);

  const value = {
    user: state.user,
    setUser,
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname.split("/")[1];
      setIsOnProtectedRoute(
        ProtectedRoutes.some((route) => currentPath.startsWith(route.replace("/", "")))
      );
      console.log("path is", window.location.pathname);
    }
  }, []);

  console.log("Is on Protected Route:", isOnProtectedRoute);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContextProvider;
