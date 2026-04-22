const { z } = require("zod");

const listMatchesSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({}),
  query: z.object({}),
});

module.exports = {
  listMatchesSchema,
};
