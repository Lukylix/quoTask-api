const express = require("express");
const router = express.Router();

const workspacesController = require("../controllers/workspaces");

// Get All workspaces
router.get("/", workspacesController.getWorkspaces);

// Get a workspace
router.get("/:id", workspacesController.getWorkspace);

// Delete
router.delete("/:id", workspacesController.deleteWorkspace);

// We doesn't need update workspace

module.exports = router;
