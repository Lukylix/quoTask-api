const express = require("express");
const app = express();

require("dotenv").config();
require("./configs/mongoose");

//BodyParser is include inside express by default
app.use(express.json());
app.use((err, req, res, next) => {
	if (err) res.status(400).send({ message: "Json parsing error" });
	next()
});

app.get("/", (req, res) => res.status(302).json("Welcome to our api"));
app.use("/login", require("./routes/login"));
app.use("/users?", require("./routes/users"));

app.use(require("./controllers/login").verify); // Middleware auth validation
app.use("/workspaces?", require("./routes/workspaces"));
app.use("/childs?", require("./routes/childs"));

app.use((req, res) => res.status(404).json({ message: "Page not found" }));

// Catching errors
app.use((err, req, res, next) => {
	// err.status never used
	res.status(err.status || 500).json({
		message: err.message || "Internal Server Error",
		err,
	});
});

module.exports = app;