const bcrypt = require("bcrypt");
const prisma = require("../lib/prisma");
const { signToken } = require("../lib/jwt");
const { createHttpError } = require("../lib/helpers");

const SALT_ROUNDS = 10;

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phoneNumber: user.phoneNumber,
    createdAt: user.createdAt,
  };
}

async function registerUser({ email, fullName, password, phoneNumber }) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedFullName = fullName.trim();
  const normalizedPhoneNumber = phoneNumber.trim();

  const [existingEmailUser, existingPhoneUser] = await Promise.all([
    prisma.user.findUnique({
      where: { email: normalizedEmail },
    }),
    prisma.user.findUnique({
      where: { phoneNumber: normalizedPhoneNumber },
    }),
  ]);

  if (existingEmailUser) {
    throw createHttpError(400, "User already exists");
  }

  if (existingPhoneUser) {
    throw createHttpError(400, "Phone number already exists");
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      fullName: normalizedFullName,
      password: hashedPassword,
      phoneNumber: normalizedPhoneNumber,
    },
  });

  const token = signToken({ userId: user.id, email: user.email });

  return {
    token,
    user: sanitizeUser(user),
  };
}

async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw createHttpError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw createHttpError(401, "Invalid email or password");
  }

  const token = signToken({ userId: user.id, email: user.email });

  return {
    token,
    user: sanitizeUser(user),
  };
}

module.exports = {
  registerUser,
  loginUser,
};
