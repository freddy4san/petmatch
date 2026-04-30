const { z } = require("zod");

const petSizeSchema = z.enum(["SMALL", "MEDIUM", "LARGE", "EXTRA_LARGE"]);
const optionalTrimmedTextSchema = (maxLength, label) =>
  z
    .string()
    .trim()
    .min(1, `${label} cannot be empty`)
    .max(maxLength, `${label} must be ${maxLength} characters or fewer`)
    .optional();

const discoverySchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({}),
  query: z
    .object({
      cursor: z.string().trim().min(1, "Cursor is required").optional(),
      fromPetId: z.string().trim().min(1, "Source pet id is required").optional(),
      limit: z.coerce.number().int().min(1).max(20).optional().default(10),
      type: optionalTrimmedTextSchema(80, "Pet type"),
      breed: optionalTrimmedTextSchema(120, "Breed"),
      minAge: z.coerce.number().int().min(0, "Minimum age must be 0 or higher").optional(),
      maxAge: z.coerce.number().int().min(0, "Maximum age must be 0 or higher").optional(),
      size: petSizeSchema.optional(),
      withPhotos: z
        .enum(["true", "false"])
        .optional()
        .transform((value) => (value === undefined ? undefined : value === "true")),
    })
    .refine(
      ({ minAge, maxAge }) => (
        minAge === undefined || maxAge === undefined || minAge <= maxAge
      ),
      {
        message: "Minimum age must be less than or equal to maximum age",
        path: ["minAge"],
      }
    ),
});

module.exports = {
  discoverySchema,
};
