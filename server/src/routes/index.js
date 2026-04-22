const express = require("express");
const authRoutes = require("./auth.routes");
const discoveryRoutes = require("./discovery.routes");
const interactionsRoutes = require("./interactions.routes");
const matchesRoutes = require("./matches.routes");
const petsRoutes = require("./pets.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/discovery", discoveryRoutes);
router.use("/interactions", interactionsRoutes);
router.use("/matches", matchesRoutes);
router.use("/pets", petsRoutes);

module.exports = router;
