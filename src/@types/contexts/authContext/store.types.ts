import { IUser } from "@/@types/interface/user.interface";

export type Store = {
	user: IUser | null;
	isLoggedIn: boolean;
};
