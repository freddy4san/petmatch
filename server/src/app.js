require("dotenv").config();

const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes");
const prisma = require("./lib/prisma");
const { createHttpError } = require("./lib/helpers");
const {
  notFoundHandler,
  errorHandler,
} = require("./middleware/error.middleware");

const app = express();

const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://localhost:3001",
  "https://petmatch-three.vercel.app",
  ...(process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(createHttpError(403, "Not allowed by CORS"));
    },
  })
);
app.use(express.json());

async function healthHandler(req, res) {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      success: true,
      data: {
        status: "ok",
        database: "ok",
      },
    });
  } catch {
    return res.status(503).json({
      success: false,
      error: "Service unavailable",
    });
  }
}

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: "PetMatch backend is running.",
    },
  });
});

app.get("/health", healthHandler);
app.get("/api/health", healthHandler);

app.use("/api", apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
