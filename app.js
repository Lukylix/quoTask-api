const express = require("express");
const app = express();

require("dotenv").config();
require("./configs/mongoose");

//BodyParser is include inside express by default
app.use(express.json());

// Validate Json
app.use((err, req, res, next) => {
	if (err) res.status(400).send({ message: "Json parsing error" });
	// Next is called by default if present on args
});

app.get("/", (req, res) => {
	//Send a response with 302 status (Found)
	res.status(302).json("Welcome to our api");
});

app.use("/login", require("./routes/login"));

//Middleware for routes that start with user or users
app.use("/users?", require("./routes/users"));

// Middleware auth validation
app.use(require("./controllers/login").verify);

app.use("/workspaces?", require("./routes/workspaces"));

app.use("/childs?", require("./routes/childs"));

app.use((req, res) => {
	res.status(404).json({ message: "Page not found" });
});

// Catching errors
// err.status never used
app.use((err, req, res, next) => {
	res.status(err.status || 500).json({
		message: err.message || "Internal Server Error",
		err,
	});
});

module.exports = app;
