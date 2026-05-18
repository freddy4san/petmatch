const { Prisma } = require("@prisma/client");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const prisma = require("../lib/prisma");
const { signToken } = require("../lib/jwt");
const { createHttpError } = require("../lib/helpers");
const { sendVerificationEmail } = require("./mail.service");

const SALT_ROUNDS = 10;
const VERIFICATION_TOKEN_BYTES = 32;
const DEFAULT_VERIFICATION_EXPIRES_IN_HOURS = 24;

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    isVerified: user.isVerified,
    verifiedAt: user.verifiedAt,
    fullName: user.fullName,
    phoneNumber: user.phoneNumber,
    bio: user.bio,
    city: user.city,
    location: user.city,
    createdAt: user.createdAt,
  };
}

function getVerificationExpiryDate() {
  const configuredHours = Number(process.env.EMAIL_VERIFICATION_EXPIRES_IN_HOURS);
  const hours = Number.isFinite(configuredHours) && configuredHours > 0
    ? configuredHours
    : DEFAULT_VERIFICATION_EXPIRES_IN_HOURS;

  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

function hashVerificationToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createEmailVerificationTokenData() {
  const token = crypto.randomBytes(VERIFICATION_TOKEN_BYTES).toString("hex");

  return {
    token,
    tokenHash: hashVerificationToken(token),
    expiresAt: getVerificationExpiryDate(),
  };
}

function isUniqueConstraintError(error) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function isRecordNotFoundError(error) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}

function getDuplicateUserError(error) {
  const target = error.meta?.target || [];

  if (target.includes("phoneNumber")) {
    return createHttpError(400, "Phone number already exists");
  }

  return createHttpError(400, "User already exists");
}

async function registerUser({
  bio,
  city,
  email,
  fullName,
  location,
  password,
  phoneNumber,
}) {
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
  const verificationToken = createEmailVerificationTokenData();

  let user;

  try {
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        fullName: normalizedFullName,
        bio,
        city: city !== undefined ? city : location,
        emailVerificationExpiresAt: verificationToken.expiresAt,
        emailVerificationTokenHash: verificationToken.tokenHash,
        password: hashedPassword,
        phoneNumber: normalizedPhoneNumber,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw getDuplicateUserError(error);
    }

    throw error;
  }

  const token = signToken({ userId: user.id, email: user.email });

  await sendVerificationEmail({
    email: user.email,
    fullName: user.fullName,
    token: verificationToken.token,
  });

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

async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw createHttpError(401, "Invalid or expired token");
  }

  return sanitizeUser(user);
}

async function resendVerificationEmail(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw createHttpError(401, "Invalid or expired token");
  }

  if (user.isVerified) {
    return {
      alreadyVerified: true,
      sent: false,
      user: sanitizeUser(user),
    };
  }

  const verificationToken = createEmailVerificationTokenData();
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerificationExpiresAt: verificationToken.expiresAt,
      emailVerificationTokenHash: verificationToken.tokenHash,
    },
  });

  await sendVerificationEmail({
    email: updatedUser.email,
    fullName: updatedUser.fullName,
    token: verificationToken.token,
  });

  return {
    alreadyVerified: false,
    sent: true,
    user: sanitizeUser(updatedUser),
  };
}

async function verifyEmail(token) {
  const tokenValue = token?.trim();

  if (!tokenValue) {
    throw createHttpError(400, "Verification token is required");
  }

  const tokenHash = hashVerificationToken(tokenValue);
  const user = await prisma.user.findUnique({
    where: { emailVerificationTokenHash: tokenHash },
  });

  if (!user || user.isVerified || !user.emailVerificationExpiresAt) {
    throw createHttpError(400, "Invalid or expired verification token");
  }

  if (user.emailVerificationExpiresAt.getTime() < Date.now()) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationExpiresAt: null,
        emailVerificationTokenHash: null,
      },
    });

    throw createHttpError(400, "Invalid or expired verification token");
  }

  const verifiedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationExpiresAt: null,
      emailVerificationTokenHash: null,
      isVerified: true,
      verifiedAt: new Date(),
    },
  });

  return {
    verified: true,
    user: sanitizeUser(verifiedUser),
  };
}

async function updateCurrentUser(userId, profileFields) {
  const data = getUserProfileData(profileFields);

  let user;

  try {
    user = await prisma.user.update({
      where: { id: userId },
      data,
    });
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      throw createHttpError(401, "Invalid or expired token");
    }

    if (isUniqueConstraintError(error)) {
      throw getDuplicateUserError(error);
    }

    throw error;
  }

  return sanitizeUser(user);
}

function getUserProfileData(input) {
  const data = {};

  if (input.fullName !== undefined) {
    data.fullName = input.fullName;
  }

  if (input.phoneNumber !== undefined) {
    data.phoneNumber = input.phoneNumber;
  }

  if (input.bio !== undefined) {
    data.bio = input.bio;
  }

  if (input.city !== undefined || input.location !== undefined) {
    data.city = input.city !== undefined ? input.city : input.location;
  }

  return data;
}

module.exports = {
  getCurrentUser,
  registerUser,
  loginUser,
  resendVerificationEmail,
  updateCurrentUser,
  verifyEmail,
};
