import { CompanyAction } from "@/@types/contexts/companyContext/companyAction.types";
import actions from "./actions";
import { Store } from "@/@types/contexts/companyContext/store.types";

const reducer = (state: Store, action: CompanyAction) => {
	switch (action.type) {
		case actions.SET_COMPANY: {
			return {
				...state,
				company: action.payload.company
			};
		}
		default:
			throw new Error("Unexpected action: Company Context");
	}
};

export default reducer;
