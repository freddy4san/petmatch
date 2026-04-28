const express = require("express");
const conversationsController = require("../controllers/conversations.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const {
  listConversationsSchema,
  markConversationReadSchema,
} = require("../types/conversations.schema");

const router = express.Router();

router.use(requireAuth);
router.get(
  "/",
  validate(listConversationsSchema),
  conversationsController.list
);
router.post(
  "/:conversationId/read",
  validate(markConversationReadSchema),
  conversationsController.markRead
);

module.exports = router;
