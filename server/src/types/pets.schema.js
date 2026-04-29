const { z } = require("zod");

const petNameSchema = z.string().trim().min(1, "Pet name is required");
const petTypeSchema = z.string().trim().min(1, "Pet type is required");
const petBreedSchema = z.string().trim().min(1, "Breed is required");
const petAgeSchema = z.coerce.number().int().min(0, "Age must be 0 or higher");
const optionalTextSchema = (maxLength, label) =>
  z
    .string()
    .trim()
    .max(maxLength, `${label} must be ${maxLength} characters or fewer`)
    .optional()
    .nullable()
    .transform((value) => {
      if (value === undefined) {
        return undefined;
      }

      return value || null;
    });
const petGenderSchema = z.enum(["MALE", "FEMALE", "UNKNOWN"]).optional().nullable();
const petSizeSchema = z
  .enum(["SMALL", "MEDIUM", "LARGE", "EXTRA_LARGE"])
  .optional()
  .nullable();
const petTemperamentSchema = z
  .array(
    z
      .string()
      .trim()
      .min(1, "Temperament cannot be empty")
      .max(40, "Temperament values must be 40 characters or fewer")
  )
  .max(10, "Temperament can include up to 10 values")
  .optional()
  .transform((values) => (
    values === undefined ? undefined : Array.from(new Set(values))
  ));
const petIdParamsSchema = z.object({
  petId: z.string().trim().min(1, "Pet id is required"),
});

const petProfileFieldsSchema = {
  bio: optionalTextSchema(500, "Pet bio"),
  gender: petGenderSchema,
  size: petSizeSchema,
  temperament: petTemperamentSchema,
  city: optionalTextSchema(120, "City"),
  location: optionalTextSchema(120, "Location"),
};

const createPetSchema = z.object({
  body: z.object({
    name: petNameSchema,
    type: petTypeSchema,
    breed: petBreedSchema,
    age: petAgeSchema,
    ...petProfileFieldsSchema,
  }),
  params: z.object({}),
  query: z.object({}),
});

const updatePetSchema = z.object({
  body: z.object({
    name: petNameSchema,
    type: petTypeSchema,
    breed: petBreedSchema,
    age: petAgeSchema,
    ...petProfileFieldsSchema,
  }),
  params: petIdParamsSchema,
  query: z.object({}),
});

const petImageParamsSchema = z.object({
  body: z.object({}).optional().default({}),
  params: petIdParamsSchema,
  query: z.object({}),
});

const deletePetSchema = z.object({
  body: z.object({}).optional().default({}),
  params: petIdParamsSchema,
  query: z.object({}),
});

module.exports = {
  createPetSchema,
  deletePetSchema,
  petImageParamsSchema,
  updatePetSchema,
};
