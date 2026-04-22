const express = require("express");
const interactionsController = require("../controllers/interactions.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { createInteractionSchema } = require("../types/interactions.schema");

const router = express.Router();

router.use(requireAuth);
router.post("/", validate(createInteractionSchema), interactionsController.create);

module.exports = router;
