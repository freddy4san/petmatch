const { z } = require("zod");

const MAX_MESSAGE_BODY_LENGTH = 2000;
const MAX_MESSAGE_PAGE_SIZE = 100;

const listConversationsSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({}),
  query: z.object({}),
});

const markConversationReadSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({
    conversationId: z.string().trim().min(1, "Conversation id is required"),
  }),
  query: z.object({}),
});

const listMatchMessagesSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({
    matchId: z.string().trim().min(1, "Match id is required"),
  }),
  query: z.object({
    before: z.string().trim().min(1, "Before cursor is required").optional(),
    limit: z.coerce
      .number()
      .int()
      .min(1, "Message limit must be at least 1")
      .max(
        MAX_MESSAGE_PAGE_SIZE,
        `Message limit must be ${MAX_MESSAGE_PAGE_SIZE} or less`
      )
      .optional(),
  }),
});

const createMatchMessageSchema = z.object({
  body: z.object({
    body: z
      .string()
      .trim()
      .min(1, "Message body is required")
      .max(
        MAX_MESSAGE_BODY_LENGTH,
        `Message body must be ${MAX_MESSAGE_BODY_LENGTH} characters or less`
      ),
  }),
  params: z.object({
    matchId: z.string().trim().min(1, "Match id is required"),
  }),
  query: z.object({}),
});

module.exports = {
  createMatchMessageSchema,
  listConversationsSchema,
  listMatchMessagesSchema,
  markConversationReadSchema,
};
