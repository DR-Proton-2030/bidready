export const SIGNUP_FIELDS = [
  {
    id: "fullName",
    label: "Full Name",
    type: "text",
    placeholder: "Type your name",
    required: true,
  },
  {
    id: "email",
    label: "Email",
    type: "email",
    placeholder: "Type your Email",
    required: true,
  },
  {
    id: "password",
    label: "Password",
    type: "password",
    placeholder: "••••••••",
    required: true,
  },
] as const;

export const SIGNUP_CONTENT = {
  title: "Sign Up To BidReady",
  subtitle: "BidReady the best platform for Manage your invest and trade in any market, Forex, crypto and etc...",
  submitButtonText: "Sign Up",
  orText: "Or",
  alternativeText: "Already have an account?",
  alternativeLink: "Sign In",
  googleButtonText: "Continue with Google",
} as const;

export const SOCIAL_LOGIN_OPTIONS = [
  {
    id: "google",
    icon: "google",
    name: "Google",
    className: "text-red-500",
  },
  {
    id: "linkedin",
    icon: "linkedin",
    name: "LinkedIn", 
    className: "text-blue-600",
  },
  {
    id: "apple",
    icon: "apple",
    name: "Apple",
    className: "text-gray-800",
  },
] as const;

export const DASHBOARD_STATS = {
  totalRevenue: {
    value: "$13,342",
    change: "+10%",
    trend: "up",
    icon: "trending-up",
  },
  totalBalance: {
    value: "$43,342", 
    change: "+15%",
    trend: "up",
    icon: "wallet",
  },
  totalCost: {
    value: "$63,342",
    change: "-5%",
    trend: "down",
    icon: "shopping-cart",
  },
} as const;
