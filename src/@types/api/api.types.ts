import { AUTHORIZATION } from "../../constants/api/auth";

const { Bearer } = AUTHORIZATION;

export type Endpoint = string;
export type Params = Record<string, unknown>;

type AuthHeader = {
	Authorization: `${typeof Bearer} ${string}`;
};

export type Payload = any;

export type Headers =
	| {
			Accept: string;
			"Content-Type": string;
	  }
	| AuthHeader;
