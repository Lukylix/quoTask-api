const express = require("express");
const router = express.Router();

const usersController = require("../controllers/users");

//Create
router.post("/", usersController.createUser);

//Get All users
router.get("/", usersController.getUsers);

//Get a user
router.get("/:id", usersController.getUser);

//Delete a user
router.delete("/:id", usersController.deleteUser);

//update
router.put("/:id", usersController.updateUser);

module.exports = router;
