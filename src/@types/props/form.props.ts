import { ChangeEvent } from "react";
import { IInput } from "../interface/input.interface";

export interface IFormProps {
  inputList: IInput[];
  heading?: string;
  objectValue: { [key: string]: any };
  handleChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}
