import { CompanyContextProps } from "@/@types/contexts/companyContext/companyContextProps.types";
import { createContext } from "react";

const CompanyContext = createContext({} as CompanyContextProps);

export default CompanyContext;
