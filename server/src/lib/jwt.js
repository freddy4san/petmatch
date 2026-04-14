const jwt = require("jsonwebtoken");

const DEFAULT_EXPIRES_IN = "7d";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  return secret;
}

function signToken(payload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || DEFAULT_EXPIRES_IN,
  });
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

module.exports = {
  signToken,
  verifyToken,
};
