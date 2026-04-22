const { ZodError } = require("zod");

function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    error: "Route not found",
  });
}

function errorHandler(error, req, res, next) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: "Validation error",
      details: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const statusCode = error.statusCode || 500;
  const message =
    statusCode === 500 ? "Internal server error" : error.message;

  if (statusCode === 500) {
    console.error(error);
  }

  return res.status(statusCode).json({
    success: false,
    error: message,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
