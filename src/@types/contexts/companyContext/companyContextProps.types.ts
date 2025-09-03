import { ICompany } from "@/@types/interface/company.interface";

export type CompanyContextProps = {
	company: ICompany | null;
	setCompany: (company: ICompany | null) => void;
};
