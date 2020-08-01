const express = require("express");
const router = express.Router();

const errorHandler = require("../utils/errors");

const childsController = require("../controllers/childs");

//Create
router.post("/", errorHandler(childsController.createChild));

//Get a child
// TODO
// router.get("/", childsController.getChild);

//Delete a child
router.delete("/", errorHandler(childsController.deleteChild));

//update
router.put("/", errorHandler(childsController.updateChild));

module.exports = router;
