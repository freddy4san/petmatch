const { z } = require("zod");

const petNameSchema = z.string().trim().min(1, "Pet name is required");
const petTypeSchema = z.string().trim().min(1, "Pet type is required");
const petBreedSchema = z.string().trim().min(1, "Breed is required");
const petAgeSchema = z.coerce.number().int().min(0, "Age must be 0 or higher");
const imageUrlSchema = z.string().trim().url("Image URL must be valid").optional().or(z.literal(""));
const petIdParamsSchema = z.object({
  petId: z.string().trim().min(1, "Pet id is required"),
});

const createPetSchema = z.object({
  body: z.object({
    name: petNameSchema,
    type: petTypeSchema,
    breed: petBreedSchema,
    age: petAgeSchema,
    imageUrl: imageUrlSchema.optional(),
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
    imageUrl: imageUrlSchema.optional(),
  }),
  params: petIdParamsSchema,
  query: z.object({}),
});

const deletePetSchema = z.object({
  body: z.object({}),
  params: petIdParamsSchema,
  query: z.object({}),
});

module.exports = {
  createPetSchema,
  deletePetSchema,
  updatePetSchema,
};
