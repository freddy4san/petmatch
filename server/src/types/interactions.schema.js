const { z } = require("zod");

const interactionTypeSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .pipe(z.enum(["LIKE", "PASS"]));

const createInteractionSchema = z.object({
  body: z.object({
    fromPetId: z.string().trim().min(1, "Source pet id is required"),
    toPetId: z.string().trim().min(1, "Target pet id is required"),
    type: interactionTypeSchema,
  }),
  params: z.object({}),
  query: z.object({}),
});

module.exports = {
  createInteractionSchema,
};
