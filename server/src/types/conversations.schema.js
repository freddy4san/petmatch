const { z } = require("zod");

const MAX_MESSAGE_BODY_LENGTH = 2000;

const listConversationsSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({}),
  query: z.object({}),
});

const listMatchMessagesSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({
    matchId: z.string().trim().min(1, "Match id is required"),
  }),
  query: z.object({}),
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
};
