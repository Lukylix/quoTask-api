// args contain req, res, next
const errorHandler = (ourFunction) => {
	return (req, res, next) => {
		return ourFunction(req, res, next).catch(next);
	};
};

// prevent node from crashing if async call failed
const unhandledRejection = (reason, promise) => {
	console.error("Unhandled Rejection at:", promise, "reason:", reason);
	// TODO Store those errors somewhere
};
