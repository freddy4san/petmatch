const { createHttpError } = require("../lib/helpers");
const { verifyToken } = require("../lib/jwt");

function requireAuth(req, res, next) {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return next(createHttpError(401, "Authentication required"));
  }

  const token = authorizationHeader.slice("Bearer ".length).trim();

  if (!token) {
    return next(createHttpError(401, "Authentication required"));
  }

  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return next(createHttpError(401, "Invalid or expired token"));
  }
}

module.exports = {
  requireAuth,
};
