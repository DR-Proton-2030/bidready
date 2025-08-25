import { IInput } from "@/@types/interface/input.interface";

export const LoginInputList: IInput[] = [
    {
        label: "Email",
        type: "email",
        placeHolder: "Enter your email",
        id: "email",
        name: "email"
    },
    {
        label: "Password",
        type: "password",
        placeHolder: "Enter your password",
        id: "password",
        name: "password"
    }
];