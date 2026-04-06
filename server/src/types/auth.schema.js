const { z } = require("zod");

const emailSchema = z.string().trim().email().transform((value) => value.toLowerCase());
const fullNameSchema = z.string().trim().min(1, "Full name is required");
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

module.exports = {
  registerSchema,
  loginSchema,
};
