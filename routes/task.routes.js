const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const taskController = require("../controllers/task.controller");

// All task routes require authentication
router.post("/", authMiddleware, taskController.createTask);
router.get("/", authMiddleware, taskController.getAllTasks);
router.get("/:id", authMiddleware, taskController.getSingleTask);
router.put("/:id", authMiddleware, taskController.updateTask);
router.delete("/:id", authMiddleware, taskController.deleteTask);

module.exports = router;