const express = require("express");
const app = express();

require("dotenv").config();
const mongoose = require("./configs/mongoose");

const hostname = "127.0.0.1";
const port = 3000;

//BodyParser is include inside express by default
app.use(express.json());
app.use((err, req, res, next) => {
	if (err) res.status(400).send({ message: "Invalid JSON !!"});
});

app.get("/", (req, res) => {
	//Send a response with 302 status (Found)
	res.status(302).json("Welcome to our api");
});

//Middleware for routes that start with user or users
app.use("/users", require("./routes/users"));
app.use("/user", require("./routes/users"));

app.use("/workspace", require("./routes/workspaces"));

app.use("/child", require("./routes/childs"));
app.use("/childs", require("./routes/childs"));

app.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});
