function getMailProvider() {
  return process.env.MAIL_PROVIDER || process.env.EMAIL_PROVIDER || "console";
}

function getApiBaseUrl() {
  return (
    process.env.PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    process.env.BACKEND_URL ||
    "http://localhost:3001/api"
  ).replace(/\/$/, "");
}

function getFrontendBaseUrl() {
  return (
    process.env.PUBLIC_FRONTEND_BASE_URL ||
    process.env.FRONTEND_URL ||
    process.env.CLIENT_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

function buildVerificationUrl(token) {
  const params = new URLSearchParams({ token });

  return `${getApiBaseUrl()}/auth/verify-email?${params.toString()}`;
}

function buildPasswordResetUrl(token) {
  const params = new URLSearchParams({ token });

  return `${getFrontendBaseUrl()}/reset-password?${params.toString()}`;
}

async function sendVerificationEmail({ email, fullName, token }) {
  const verificationUrl = buildVerificationUrl(token);
  const provider = getMailProvider();

  if (provider === "console") {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "MAIL_PROVIDER is set to console; verification email was not sent."
      );
    } else {
      console.info(
        [
          "PetMatch email verification:",
          `To: ${email}`,
          `Name: ${fullName || "PetMatch user"}`,
          `Verify: ${verificationUrl}`,
        ].join("\n")
      );
    }

    return {
      provider,
      verificationUrl:
        process.env.NODE_ENV === "production" ? undefined : verificationUrl,
    };
  }

  throw new Error(`Unsupported mail provider: ${provider}`);
}

async function sendPasswordResetEmail({ email, fullName, token }) {
  const resetUrl = buildPasswordResetUrl(token);
  const provider = getMailProvider();

  if (provider === "console") {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "MAIL_PROVIDER is set to console; password reset email was not sent."
      );
    } else {
      console.info(
        [
          "PetMatch password reset:",
          `To: ${email}`,
          `Name: ${fullName || "PetMatch user"}`,
          `Reset: ${resetUrl}`,
        ].join("\n")
      );
    }

    return {
      provider,
      resetUrl: process.env.NODE_ENV === "production" ? undefined : resetUrl,
    };
  }

  throw new Error(`Unsupported mail provider: ${provider}`);
}

module.exports = {
  buildPasswordResetUrl,
  buildVerificationUrl,
  sendPasswordResetEmail,
  sendVerificationEmail,
};
