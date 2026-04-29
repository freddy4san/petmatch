const { z } = require("zod");

const emailSchema = z.string().trim().email().transform((value) => value.toLowerCase());
const fullNameSchema = z.string().trim().min(1, "Full name is required");
const optionalProfileTextSchema = (maxLength, label) =>
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
const passwordSchema = z
  .string()
  .trim()
  .min(8, "Password must be at least 8 characters long");
const phoneNumberSchema = z.string().trim().min(1, "Phone number is required");

const registerSchema = z.object({
  body: z.object({
    email: emailSchema,
    fullName: fullNameSchema,
    password: passwordSchema,
    phoneNumber: phoneNumberSchema,
    bio: optionalProfileTextSchema(500, "Bio"),
    city: optionalProfileTextSchema(120, "City"),
    location: optionalProfileTextSchema(120, "Location"),
  }),
  params: z.object({}),
  query: z.object({}),
});

const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().trim().min(1, "Password is required"),
  }),
  params: z.object({}),
  query: z.object({}),
});

const updateCurrentUserSchema = z.object({
  body: z
    .object({
      fullName: optionalProfileTextSchema(120, "Full name"),
      phoneNumber: optionalProfileTextSchema(40, "Phone number"),
      bio: optionalProfileTextSchema(500, "Bio"),
      city: optionalProfileTextSchema(120, "City"),
      location: optionalProfileTextSchema(120, "Location"),
    })
    .refine(
      (body) => Object.values(body).some((value) => value !== undefined),
      "At least one profile field is required"
    ),
  params: z.object({}),
  query: z.object({}),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateCurrentUserSchema,
};
