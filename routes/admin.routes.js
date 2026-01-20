const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const adminController = require("../controllers/admin.controller");

// All admin routes require authentication + admin role
router.use(authMiddleware);
router.use(roleMiddleware("admin"));

// Get all users
router.get("/users", adminController.getAllUsers);

// Update user role
router.put("/users/:id/role", adminController.updateUserRole);

// Delete user
router.delete("/users/:id", adminController.deleteUser);

module.exports = router;