export interface IUser {
  is_already_registered: boolean;
  _id: string;
  user_id: string;
  full_name: string;
  profile_picture: string;
  email: string;
  primary_phone_number: string;
  secondary_phone_number: string;
  state: string;
  country: string;
  date_of_birth: Date;
  gender: string;
  has_login: boolean;
  password: string;
  created_by: string;
  role: string;
  household_object_id: string;
  member_id?: string;
  accuHealth_patient_id?: string;
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
