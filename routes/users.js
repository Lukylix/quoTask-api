const express = require("express");
const router = express.Router();

const usersController = require("../controllers/users");

//Create
router.post("/", usersController.createUser);

// Middleware auth validation
router.use(require("../controllers/login").verify);

//Get All users
// Not Needed only for futures admins
// router.get("/", usersController.getUsers);

//Get a user
router.get("/", usersController.getUser);

//Delete a user
router.delete("/", usersController.deleteUser);

//update
router.put("/", usersController.updateUser);

module.exports = router;
