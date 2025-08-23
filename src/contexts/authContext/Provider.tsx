"use client";
import initialState from "./store";
import actions from "./actions";
import reducer from "./reducer";
import { useCallback, useEffect, useReducer, useState } from "react";
import AuthContext from "./authContext";
import { IUser } from "@/@types/interface/user.interface";
import { ContextProviderProps } from "@/@types/contexts/context.types";

const AuthContextProvider = ({ children }: ContextProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  // const [isOnDashboard, setIsOnDashboard] = useState<boolean>(false); 

  // const fetchUser = useCallback(async () => {
  //   try {
  //     if (!isOnDashboard) return;
  //     const response = await api.auth.verifyUser();
  //     dispatch({
  //       type: actions.SET_USER,
  //       payload: { ...state, user: response },
  //     });
  //   } catch (error) {
  //     dispatch({ type: actions.SET_USER, payload: { ...state, user: null } });
  //   }
  // }, [isOnDashboard]);

  const setUser = useCallback((user: IUser) => {
    dispatch({ type: actions.SET_USER, payload: { ...state, user } });
  }, []);

  const value = {
    user: state.user,
    setUser,
  };

  // useEffect(() => {
  //   fetchUser();
  // }, [fetchUser]);

  //  useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     setIsOnDashboard(window.location.pathname.includes("admin"));
  //   }
  // }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContextProvider;
