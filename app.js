const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

require("dotenv").config();
require("./configs/mongoose");

//BodyParser is include inside express by default
app.use(express.json());

// Validate Json
app.use((err, req, res, next) => {
	if (err) res.status(400).send({ message: "Json parsing error" });
});

app.get("/", (req, res) => {
	//Send a response with 302 status (Found)
	res.status(302).json("Welcome to our api");
});

app.use("/login", require("./routes/login"));

// Midfleware that valide auth
app.use(require("./controllers/login").verify);

//Middleware for routes that start with user or users
app.use("/user?s", require("./routes/users"));

app.use("/workspace?s", require("./routes/workspaces"));

app.use("/child?s", require("./routes/childs"));

app.use((req, res) => {
	res.status(404).json({ message: "Page not found" });
});

module.exports = app;
