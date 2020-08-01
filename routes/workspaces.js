const express = require("express");
const router = express.Router();

const workspacesController = require("../controllers/workspaces");

// Get All workspaces
// Not Needed only for futures admins
// router.get("/", workspacesController.getWorkspaces);

// Get a workspace
router.get("/", workspacesController.getWorkspace);

// Delete
router.delete("/", workspacesController.deleteWorkspace);

// We doesn't need update workspace

module.exports = router;
