const express = require("express");
const app = express();

const hostname = "127.0.0.1";
const port = 3000;

//BodyParser is include inside express by default
app.use(express.json());

app.get("/", (req, res) => {
	//Send a response with 302 status (Found)
	res.status(302).json("Welcome to our api");
});

app.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});
