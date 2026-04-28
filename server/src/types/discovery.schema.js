const { z } = require("zod");

const discoverySchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({}),
  query: z.object({
    cursor: z.string().trim().min(1, "Cursor is required").optional(),
    fromPetId: z.string().trim().min(1, "Source pet id is required").optional(),
    limit: z.coerce.number().int().min(1).max(20).optional().default(10),
  }),
});

module.exports = {
  discoverySchema,
};
