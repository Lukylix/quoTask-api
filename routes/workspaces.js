const express = require("express");
const router = express.Router();

const errorHandler = require("../utils/errors");

const workspacesController = require("../controllers/workspaces");

// Middleware auth validation
router.use(require("../controllers/login").verify);

// Get a workspace
router.get("/", errorHandler(workspacesController.getWorkspace));

// Delete
router.delete("/", errorHandler(workspacesController.deleteWorkspace));

// We doesn't need update workspace

module.exports = router;
