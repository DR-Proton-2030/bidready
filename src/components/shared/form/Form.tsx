
import React from "react";
import CommonInput from "./commonInput/CommonInput";
import PasswordInput from "./passwordInput/PasswordInput";
import { IFormProps } from "@/@types/props/form.props";

const Form: React.FC<IFormProps> = ({
  inputList,
  objectValue,
  handleChange,
}) => {
  return (
    <div>
      {inputList.map((input, index) => {
        if (input.type === "password") {
          return (
            <PasswordInput
              input={input}
              key={index}
              value={objectValue[input.name]}
              handleChange={handleChange}
            />
          );
        }
        return (
          <CommonInput
            input={input}
            key={index}
            value={objectValue[input.name]}
            handleChange={handleChange}
          />
        );
      })}
    </div>
  );
};

export default Form;
