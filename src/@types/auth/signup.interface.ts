export interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
}

export interface SignupFieldConfig {
  id: keyof SignupFormData;
  label: string;
  type: "text" | "email" | "password";
  placeholder: string;
  required: boolean;
}

export interface SocialLoginOption {
  id: string;
  icon: string;
  name: string;
  className: string;
}

export interface DashboardStat {
  value: string;
  change: string;
  trend: "up" | "down";
  icon: string;
}

export interface SignupPageProps {
  onSubmit?: (data: SignupFormData) => void;
  onSocialLogin?: (provider: string) => void;
  isLoading?: boolean;
}
