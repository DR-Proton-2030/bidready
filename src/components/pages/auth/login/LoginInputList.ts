import { IInput } from "@/@types/interface/input.interface";

export const LoginInputList: IInput[] = [
    {
        label: "Username",
        type: "username",
        placeHolder: "Enter your email",
        id: "username",
        name: "username"
    },
    {
        label: "Password",
        type: "password",
        placeHolder: "Enter your password",
        id: "password",
        name: "password"
    }
];