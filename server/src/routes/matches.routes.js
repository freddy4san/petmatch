const express = require("express");
const conversationsController = require("../controllers/conversations.controller");
const matchesController = require("../controllers/matches.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const {
  createMatchMessageSchema,
  listMatchMessagesSchema,
} = require("../types/conversations.schema");
const { listMatchesSchema } = require("../types/matches.schema");

const router = express.Router();

router.use(requireAuth);
router.get("/", validate(listMatchesSchema), matchesController.list);
router.get(
  "/:matchId/messages",
  validate(listMatchMessagesSchema),
  conversationsController.listMessages
);
router.post(
  "/:matchId/messages",
  validate(createMatchMessageSchema),
  conversationsController.createMessage
);

module.exports = router;
