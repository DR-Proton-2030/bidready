"use client"
import { AuthContextProps } from "@/@types/contexts/authContext/authContextProps.types";
import { createContext } from "react";

const AuthContext = createContext({} as AuthContextProps);

export default AuthContext;
