const express = require("express");
const router = express.Router();

const childsController = require("../controllers/childs");

//Create
// router.post("/", childsController.createChild);

//Get All childs
// router.get("/", childsController.getChilds);

//Get a child
// router.get("/", childsController.getChild);

//Delete a child
router.delete("/:workspace_id", childsController.deleteChild);

//update
router.put("/:workspace_id", childsController.updateChild);

module.exports = router;
