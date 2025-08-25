import { IUser } from "./user.interface";
import { ICompany } from "./company.interface";

export interface ISignupStep1 {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  emp_id: string;
}

export interface ISignupStep2 {
  company_name: string;
  website: string;
  role: string;
}

export interface ISignupFormData extends ISignupStep1, ISignupStep2 {
  profile_picture?: File;
  company_logo?: File;
}

export interface ISignupResponse {
  success: boolean;
  message: string;
  user?: IUser;
  company?: ICompany;
}
