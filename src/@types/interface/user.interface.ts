import { ICompany } from "./company.interface";

export interface IUser {
	full_name: string;
	email: string;
	password: string;
	emp_id: string;
	company_object_id: string;
	role: string;
	profile_picture: string;
  company_details?: ICompany;
}
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive: string;
  avatar: string;
}

export interface UserRole {
  name: string;
  value: string;
}
