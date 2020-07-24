const express = require("express");
const app = express();
//BodyParser is include inside express by default
require("dotenv").config();
require("./configs/mongoose");

app.use(express.json());
app.use((err, req, res, next) => {
	if (err) res.status(400).send({ message: "Invalid JSON !!" });
});

app.get("/", (req, res) => {
	//Send a response with 302 status (Found)
	res.status(302).json("Welcome to our api");
});

//Middleware for routes that start with user or users
app.use("/user?s", require("./routes/users"));

app.use("/workspace?s", require("./routes/workspaces"));

app.use("/child?s", require("./routes/childs"));

module.exports = app;


