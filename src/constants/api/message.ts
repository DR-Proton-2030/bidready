export const MESSAGE = {
	post: {
		succ: "Data added successfully",
		fail: "Failed to add data",
		sameEntry: "Same entry not allowed",
		succAuth:"Authentication Successful!",
		failAuth:"Login Unsuccessful!",
		custom: (msg: string) => msg
	},
	get: {
		succ: "Data fetched successfully",
		fail: "Failed to fetch data",
		empty: "Database empty",
		enough: "Not Enough Data to Fetch",
		custom: (msg: string) => msg
	},
	put: {
		succ: "Data edited successfully",
		fail: "Failed to edit data",
		custom: (msg: string) => msg
	},
	patch: {
		succ: "Data edited successfully",
		fail: "Failed to edit data",
		custom: (msg: string) => msg
	},
	delete: {
		succ: "Data deleted successfully",
		fail: "Failed to delete data",
		custom: (msg: string) => msg
	},
	error: "Error",
	none: "No such data",
	custom: (msg: string) => msg
};
