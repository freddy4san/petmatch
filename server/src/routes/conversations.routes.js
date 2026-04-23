const express = require("express");
const conversationsController = require("../controllers/conversations.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const {
  listConversationsSchema,
} = require("../types/conversations.schema");

const router = express.Router();

router.use(requireAuth);
router.get(
  "/",
  validate(listConversationsSchema),
  conversationsController.list
);

module.exports = router;
