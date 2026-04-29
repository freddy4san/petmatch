const express = require("express");
const authController = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const {
  registerSchema,
  loginSchema,
  updateCurrentUserSchema,
} = require("../types/auth.schema");

const router = express.Router();

router.get("/me", requireAuth, authController.me);
router.patch(
  "/me",
  requireAuth,
  validate(updateCurrentUserSchema),
  authController.updateMe
);
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);

module.exports = router;
