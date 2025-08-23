import { HTMLInputTypeAttribute } from "react";

export interface IInput {
  label?: string;
  type: HTMLInputTypeAttribute | "select" | "checkbox" | "textarea" | "phone";
  placeHolder: string;
  isRequired?: boolean;
  id?: string;
  name: string;
  iconButton?: React.ReactNode;
  options?: { label: string; value: string }[]; // Optional
  source?: string; // Optional
  defaultValue?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
}
