import { useCallback, useReducer } from "react";
import { IUser } from "../../@types/interface/user.interface";
import actions from "./actions";
import reducer from "./reducer";
import { ContextProviderProps } from "../../@types/contexts/context.types";
import { Store } from "@/@types/contexts/companyContext/store.types";
import { ICompany } from "@/@types/interface/company.interface";
import CompanyContext from "./companyContext";

const initialState: Store = {
  company: null
};

const CompanyContextProvider = ({ children }: ContextProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setCompany = useCallback((company: ICompany | null) => {
    dispatch({ type: actions.SET_COMPANY, payload: { company } });
  }, []);

  return (
    <CompanyContext.Provider value={{ company: state.company, setCompany }}>
      {children}
    </CompanyContext.Provider>
  );
};

export default CompanyContextProvider;
