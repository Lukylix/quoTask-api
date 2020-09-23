const express = require("express");
const router = express.Router();

const errorHandler = require("../utils/errors");
const usersController = require("../controllers/users");

router.post("/", errorHandler(usersController.createUser)); // Create a user
router.use(require("../controllers/login").verify); // Middleware auth validation
router.get("/", errorHandler(usersController.getUser)); // Get a user
router.put("/", errorHandler(usersController.updateUser)); // Update a user
router.delete("/", errorHandler(usersController.deleteUser)); // Delete a user

module.exports = router;
