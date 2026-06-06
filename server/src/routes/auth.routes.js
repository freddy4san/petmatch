const express = require("express");
const authController = require("../controllers/auth.controller");
const {
  createAuthRateLimiter,
} = require("../middleware/auth-rate-limit.middleware");
const { requireAuth } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const {
  forgotPasswordSchema,
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  updateCurrentUserSchema,
  verifyEmailSchema,
} = require("../types/auth.schema");

const router = express.Router();
const authRateLimiter = createAuthRateLimiter();

router.get("/me", requireAuth, authController.me);
router.get(
  "/verify-email",
  validate(verifyEmailSchema),
  authController.verifyEmail
);
router.patch(
  "/me",
  requireAuth,
  validate(updateCurrentUserSchema),
  authController.updateMe
);
router.post(
  "/resend-verification",
  requireAuth,
  authController.resendVerification
);
router.post(
  "/forgot-password",
  authRateLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  "/reset-password",
  authRateLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword
);
router.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  authController.register
);
router.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  authController.login
);

module.exports = router;
