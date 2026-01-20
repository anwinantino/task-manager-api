const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

// Register route
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.getProfile);
router.post("/refresh", authController.refreshToken);

// TEMP: Admin-only test route
router.get("/admin-test", authMiddleware, roleMiddleware("admin"), (req, res) => {
  res.json({
    success: true,
    message: "Welcome Admin, you have access"
  });
});

module.exports = router;