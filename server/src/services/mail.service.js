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

function buildVerificationUrl(token) {
  const params = new URLSearchParams({ token });

  return `${getApiBaseUrl()}/auth/verify-email?${params.toString()}`;
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

module.exports = {
  buildVerificationUrl,
  sendVerificationEmail,
};
