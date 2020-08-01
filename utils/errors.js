// args contain req, res, next
const errorHandler = (ourFunction) => {
	return (req, res, next) => {
		if ("catch" in ourFunction) return ourFunction(req, res, next).catch((err) => next(err));
		return ourFunction(req, res, next);
	};
};

// prevent node from crashing if async call failed
const unhandledRejection = (reason, promise) => {
	console.error("Unhandled Rejection at:", promise, "reason:", reason);
	// TODO Store those errors somewhere
};

module.exports = errorHandler;
