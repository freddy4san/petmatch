const express = require("express");
const authRoutes = require("./auth.routes");
const petsRoutes = require("./pets.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/pets", petsRoutes);

module.exports = router;
