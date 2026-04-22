const express = require("express");
const discoveryController = require("../controllers/discovery.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { discoverySchema } = require("../types/discovery.schema");

const router = express.Router();

router.use(requireAuth);
router.get("/", validate(discoverySchema), discoveryController.list);

module.exports = router;
