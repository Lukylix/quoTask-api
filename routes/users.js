const express = require("express");
const router = express.Router();

const errorHandler = require("../utils/errors");

const usersController = require("../controllers/users");

//Create
router.post("/", errorHandler(usersController.createUser));

// Middleware auth validation
router.use(require("../controllers/login").verify);

//Get All users
// Not Needed only for futures admins
// router.get("/", usersController.getUsers);

//Get a user
router.get("/", errorHandler(usersController.getUser));

//Delete a user
router.delete("/", errorHandler(usersController.deleteUser));

//update
router.put("/", errorHandler(usersController.updateUser));

module.exports = router;
