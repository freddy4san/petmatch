const { rateLimit } = require("express-rate-limit");
const { createHttpError } = require("../lib/helpers");

const DEFAULT_AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_AUTH_RATE_LIMIT_MAX = 10;
const AUTH_RATE_LIMIT_MESSAGE =
  "Too many authentication attempts. Please try again later.";

function readPositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function createAuthRateLimiter(options = {}) {
  const windowMs =
    options.windowMs ??
    readPositiveInteger(
      process.env.AUTH_RATE_LIMIT_WINDOW_MS,
      DEFAULT_AUTH_RATE_LIMIT_WINDOW_MS
    );
  const max =
    options.max ??
    readPositiveInteger(
      process.env.AUTH_RATE_LIMIT_MAX,
      DEFAULT_AUTH_RATE_LIMIT_MAX
    );

  return rateLimit({
    windowMs,
    max,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (req, res, next) =>
      next(createHttpError(429, AUTH_RATE_LIMIT_MESSAGE)),
  });
}

module.exports = {
  AUTH_RATE_LIMIT_MESSAGE,
  DEFAULT_AUTH_RATE_LIMIT_MAX,
  DEFAULT_AUTH_RATE_LIMIT_WINDOW_MS,
  createAuthRateLimiter,
};
