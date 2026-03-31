const { z } = require("zod");

const emailSchema = z.email().transform((value) => value.trim().toLowerCase());
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long");

const registerSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
  }),
  params: z.object({}),
  query: z.object({}),
});

const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
  }),
  params: z.object({}),
  query: z.object({}),
});

module.exports = {
  registerSchema,
  loginSchema,
};
