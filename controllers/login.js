const jwt = require("jsonwebtoken");
const User = require("../models/User").model;

exports.login = (req, res) => {
	User.findOne({ email: req.body.email ? req.body.email.toLowerCase().trim() : null }, "+password")
		.then((userDoc) => {
			if (!("password" in req.body))
				return res.status(400).json({
					message: "Bad request, need password",
				});

			const plainPassword = req.body.password;
			// Use our userShcema method
			userDoc.verifyPassword(plainPassword, (err, isValid) => {
				if (err || !isValid) return res.status(401).json({ message: "Bad password" });
				const user = userDoc.toObject();
				// Remove passowrd from token
				delete user.password;

				const token = jwt.sign(user, process.env.JWT_SECRET);
				res.json({ jwt: token });
			});
		})
		.catch((err) =>
			res.status(404).json({
				message: "User Not Found",
			})
		);
};

exports.verify = (req, res, next) => {
	// auth = "Bearer Token" so we only want the token
	const token =
		req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer"
			? req.headers.authorization.split(" ")[1]
			: null;

	if (!token) return res.status(401).json("Bearer token needed");

	jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
		if (err) return res.status(403).json("Token no longer valid");
		req.auth = decoded;
		return next();
	});
};
