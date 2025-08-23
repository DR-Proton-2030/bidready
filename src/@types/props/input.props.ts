import { IInput } from "../interface/input.interface";

export interface IInputProps {
  input: IInput;
  value: string;
  widthClass?: string;
  isRequired?: boolean;
  options?: { label: string; value: string }[];
  handleChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}
