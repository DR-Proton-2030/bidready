import { IUser } from "@/@types/interface/user.interface";

export type AuthContextProps = {
	user: IUser | null;
	setUser: (user: IUser) => void;
};
