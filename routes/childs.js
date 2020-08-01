const express = require("express");
const router = express.Router();

const childsController = require("../controllers/childs");

//Create
router.post("/", childsController.createChild);

//Get a child
// TODO
// router.get("/", childsController.getChild);

//Delete a child
router.delete("/", childsController.deleteChild);

//update
router.put("/", childsController.updateChild);

module.exports = router;
