const assert = require("node:assert/strict");
const { after, mock, test } = require("node:test");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const http = require("node:http");
const express = require("express");
const { ZodError } = require("zod");

const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const {
  emitMatchCreated,
  emitMessageCreated,
  setMatchBroadcaster,
  setMessageBroadcaster,
} = require("../src/lib/realtime");
const {
  AUTH_RATE_LIMIT_MESSAGE,
  createAuthRateLimiter,
} = require("../src/middleware/auth-rate-limit.middleware");
const { requireAuth } = require("../src/middleware/auth.middleware");
const { errorHandler } = require("../src/middleware/error.middleware");
const validate = require("../src/middleware/validate.middleware");
const authService = require("../src/services/auth.service");
const { buildDiscoveryFilterWhere } = require("../src/services/discovery.service");
const { buildPasswordResetUrl } = require("../src/services/mail.service");
const {
  forgotPasswordSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} = require("../src/types/auth.schema");
const { discoverySchema } = require("../src/types/discovery.schema");

after(async () => {
  await prisma.$disconnect();
});

function getNextError(handler, req) {
  return new Promise((resolve) => {
    handler(req, {}, (error) => {
      resolve(error || null);
    });
  });
}

function listen(app) {
  const server = http.createServer(app);

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve(server);
    });
  });
}

function closeServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

async function postJson(url) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  const body = await response.json();

  return {
    status: response.status,
    body,
  };
}

async function getJson(url, options = {}) {
  const response = await fetch(url, options);
  const body = await response.json();

  return {
    response,
    status: response.status,
    body,
  };
}

test("app exports an express request handler", () => {
  assert.equal(typeof app, "function");
  assert.equal(typeof app.use, "function");
});

test("app includes Helmet security headers without blocking allowed CORS origins", async () => {
  const server = await listen(app);
  const { port } = server.address();
  const url = `http://127.0.0.1:${port}/`;

  try {
    const { response, status, body } = await getJson(url, {
      headers: {
        Origin: "http://localhost:3000",
      },
    });

    assert.equal(status, 200);
    assert.equal(body.success, true);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(
      response.headers.get("access-control-allow-origin"),
      "http://localhost:3000"
    );
  } finally {
    await closeServer(server);
  }
});

test("requireAuth rejects requests without a bearer token", async () => {
  const error = await getNextError(requireAuth, {
    headers: {},
  });

  assert.equal(error.statusCode, 401);
  assert.equal(error.message, "Authentication required");
});

test("validate rejects invalid registration input before controller logic", async () => {
  const error = await getNextError(validate(registerSchema), {
    body: {
      email: "not-an-email",
      fullName: "",
      password: "short",
      phoneNumber: "",
    },
    params: {},
    query: {},
  });

  assert.ok(error instanceof ZodError);
  assert.ok(error.issues.length > 0);
});

test("auth rate limiter returns the standard error response after repeated attempts", async () => {
  const testApp = express();
  const limiter = createAuthRateLimiter({
    windowMs: 60 * 1000,
    max: 2,
  });

  testApp.post("/api/auth/login", limiter, (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        ok: true,
      },
    });
  });
  testApp.use(errorHandler);

  const server = await listen(testApp);
  const { port } = server.address();
  const url = `http://127.0.0.1:${port}/api/auth/login`;

  try {
    assert.equal((await postJson(url)).status, 200);
    assert.equal((await postJson(url)).status, 200);

    const limited = await postJson(url);

    assert.equal(limited.status, 429);
    assert.deepEqual(limited.body, {
      success: false,
      error: AUTH_RATE_LIMIT_MESSAGE,
    });
  } finally {
    await closeServer(server);
  }
});

test("auth routes handle proxied requests without rate-limit proxy errors", async () => {
  const server = await listen(app);
  const { port } = server.address();
  const url = `http://127.0.0.1:${port}/api/auth/login`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": "203.0.113.10",
      },
      body: "{}",
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);
    assert.equal(body.error, "Validation error");
  } finally {
    await closeServer(server);
  }
});

test("email verification validation accepts GET requests without a body", async () => {
  const req = {
    body: undefined,
    params: {},
    query: {
      token: " verification-token ",
    },
  };
  const error = await getNextError(validate(verifyEmailSchema), req);

  assert.equal(error, null);
  assert.deepEqual(req.body, {});
  assert.equal(req.query.token, "verification-token");
});

test("forgot password validation normalizes email input", async () => {
  const req = {
    body: {
      email: " USER@Example.COM ",
    },
    params: {},
    query: {},
  };
  const error = await getNextError(validate(forgotPasswordSchema), req);

  assert.equal(error, null);
  assert.deepEqual(req.body, {
    email: "user@example.com",
  });
});

test("reset password validation trims token and enforces password policy", async () => {
  const req = {
    body: {
      token: " reset-token ",
      password: "new-password",
    },
    params: {},
    query: {},
  };
  const error = await getNextError(validate(resetPasswordSchema), req);

  assert.equal(error, null);
  assert.equal(req.body.token, "reset-token");

  await assert.rejects(
    resetPasswordSchema.parseAsync({
      body: {
        token: "reset-token",
        password: "short",
      },
      params: {},
      query: {},
    }),
    ZodError
  );
});

test("password reset URLs target the frontend reset page", () => {
  const previousFrontendUrl = process.env.PUBLIC_FRONTEND_BASE_URL;

  process.env.PUBLIC_FRONTEND_BASE_URL = "https://petmatch.example";

  try {
    assert.equal(
      buildPasswordResetUrl("reset token"),
      "https://petmatch.example/reset-password?token=reset+token"
    );
  } finally {
    if (previousFrontendUrl === undefined) {
      delete process.env.PUBLIC_FRONTEND_BASE_URL;
    } else {
      process.env.PUBLIC_FRONTEND_BASE_URL = previousFrontendUrl;
    }
  }
});

test("requestPasswordReset stores only a hashed token and returns a generic response", async () => {
  const previousMailProvider = process.env.MAIL_PROVIDER;
  const previousNodeEnv = process.env.NODE_ENV;
  const previousFrontendUrl = process.env.PUBLIC_FRONTEND_BASE_URL;
  const originalFindUnique = prisma.user.findUnique;
  const originalUpdate = prisma.user.update;
  const updates = [];
  const logs = [];
  prisma.user.findUnique = async (args) => {
    assert.deepEqual(args, {
      where: {
        email: "user@example.com",
      },
    });

    return {
      id: "user-1",
      email: "user@example.com",
      fullName: "Test User",
    };
  };
  prisma.user.update = async (args) => {
    updates.push(args);

    return {
      id: "user-1",
      email: "user@example.com",
      fullName: "Test User",
    };
  };
  const consoleInfoMock = mock.method(console, "info", (message) => {
    logs.push(message);
  });

  process.env.MAIL_PROVIDER = "console";
  process.env.NODE_ENV = "development";
  process.env.PUBLIC_FRONTEND_BASE_URL = "https://petmatch.example";

  try {
    const result = await authService.requestPasswordReset(" USER@Example.COM ");

    assert.deepEqual(result, {
      message:
        "If an account exists for that email, a password reset link has been sent.",
      sent: true,
    });
    assert.equal(updates.length, 1);
    assert.equal(updates[0].where.id, "user-1");
    assert.ok(updates[0].data.passwordResetExpiresAt instanceof Date);
    assert.ok(updates[0].data.passwordResetExpiresAt.getTime() > Date.now());
    assert.match(updates[0].data.passwordResetTokenHash, /^[a-f0-9]{64}$/);
    assert.equal(logs.length, 1);

    const resetLine = logs[0]
      .split("\n")
      .find((line) => line.startsWith("Reset: "));
    const resetUrl = new URL(resetLine.replace("Reset: ", ""));
    const rawToken = resetUrl.searchParams.get("token");
    const rawTokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    assert.match(rawToken, /^[a-f0-9]{64}$/);
    assert.equal(updates[0].data.passwordResetTokenHash, rawTokenHash);
    assert.notEqual(updates[0].data.passwordResetTokenHash, rawToken);
  } finally {
    prisma.user.findUnique = originalFindUnique;
    prisma.user.update = originalUpdate;
    consoleInfoMock.mock.restore();

    if (previousMailProvider === undefined) {
      delete process.env.MAIL_PROVIDER;
    } else {
      process.env.MAIL_PROVIDER = previousMailProvider;
    }

    if (previousNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previousNodeEnv;
    }

    if (previousFrontendUrl === undefined) {
      delete process.env.PUBLIC_FRONTEND_BASE_URL;
    } else {
      process.env.PUBLIC_FRONTEND_BASE_URL = previousFrontendUrl;
    }
  }
});

test("requestPasswordReset does not reveal when an email is missing", async () => {
  const originalFindUnique = prisma.user.findUnique;
  const originalUpdate = prisma.user.update;
  let updateCalls = 0;

  prisma.user.findUnique = async () => null;
  prisma.user.update = async () => {
    updateCalls += 1;
    throw new Error("update should not be called");
  };

  try {
    const result = await authService.requestPasswordReset("missing@example.com");

    assert.deepEqual(result, {
      message:
        "If an account exists for that email, a password reset link has been sent.",
      sent: true,
    });
    assert.equal(updateCalls, 0);
  } finally {
    prisma.user.findUnique = originalFindUnique;
    prisma.user.update = originalUpdate;
  }
});

test("requestPasswordReset keeps generic response when reset email fails", async () => {
  const previousMailProvider = process.env.MAIL_PROVIDER;
  const originalFindUnique = prisma.user.findUnique;
  const originalUpdate = prisma.user.update;
  const consoleErrorMock = mock.method(console, "error", () => {});

  process.env.MAIL_PROVIDER = "unsupported-provider";
  prisma.user.findUnique = async () => ({
    id: "user-1",
    email: "user@example.com",
    fullName: "Test User",
  });
  prisma.user.update = async () => ({
    id: "user-1",
    email: "user@example.com",
    fullName: "Test User",
  });

  try {
    const result = await authService.requestPasswordReset("user@example.com");

    assert.deepEqual(result, {
      message:
        "If an account exists for that email, a password reset link has been sent.",
      sent: true,
    });
    assert.equal(consoleErrorMock.mock.callCount(), 1);
  } finally {
    prisma.user.findUnique = originalFindUnique;
    prisma.user.update = originalUpdate;
    consoleErrorMock.mock.restore();

    if (previousMailProvider === undefined) {
      delete process.env.MAIL_PROVIDER;
    } else {
      process.env.MAIL_PROVIDER = previousMailProvider;
    }
  }
});

test("resetPassword hashes the new password and clears reset token fields", async () => {
  const rawToken = "valid-reset-token";
  const expectedTokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  let updatedData;
  let updateWhere;
  const originalFindUnique = prisma.user.findUnique;
  const originalUpdateMany = prisma.user.updateMany;

  prisma.user.findUnique = async (args) => {
    assert.deepEqual(args, {
      where: {
        passwordResetTokenHash: expectedTokenHash,
      },
    });

    return {
      id: "user-1",
      passwordResetExpiresAt: new Date(Date.now() + 60 * 1000),
    };
  };
  prisma.user.updateMany = async (args) => {
    updateWhere = args.where;
    updatedData = args.data;

    return {
      count: 1,
    };
  };

  try {
    const result = await authService.resetPassword({
      token: rawToken,
      password: "new-password",
    });

    assert.deepEqual(result, {
      reset: true,
    });
    assert.equal(updateWhere.id, "user-1");
    assert.equal(updateWhere.passwordResetTokenHash, expectedTokenHash);
    assert.ok(updateWhere.passwordResetExpiresAt.gt instanceof Date);
    assert.notEqual(updatedData.password, "new-password");
    assert.equal(await bcrypt.compare("new-password", updatedData.password), true);
    assert.equal(updatedData.passwordResetExpiresAt, null);
    assert.equal(updatedData.passwordResetTokenHash, null);
  } finally {
    prisma.user.findUnique = originalFindUnique;
    prisma.user.updateMany = originalUpdateMany;
  }
});

test("resetPassword rejects when token was consumed concurrently", async () => {
  const originalFindUnique = prisma.user.findUnique;
  const originalUpdateMany = prisma.user.updateMany;

  prisma.user.findUnique = async () => ({
    id: "user-1",
    passwordResetExpiresAt: new Date(Date.now() + 60 * 1000),
  });
  prisma.user.updateMany = async () => ({
    count: 0,
  });

  try {
    await assert.rejects(
      authService.resetPassword({
        token: "already-used-token",
        password: "new-password",
      }),
      (error) => {
        assert.equal(error.statusCode, 400);
        assert.equal(error.message, "Invalid or expired password reset token");
        return true;
      }
    );
  } finally {
    prisma.user.findUnique = originalFindUnique;
    prisma.user.updateMany = originalUpdateMany;
  }
});

test("realtime broadcasters route message and match payloads separately", () => {
  const messagePayloads = [];
  const matchPayloads = [];

  setMessageBroadcaster((payload) => messagePayloads.push(payload));
  setMatchBroadcaster((payload) => matchPayloads.push(payload));

  emitMessageCreated({
    message: {
      id: "message-1",
    },
  });
  emitMatchCreated({
    matchId: "match-1",
  });

  assert.deepEqual(messagePayloads, [
    {
      message: {
        id: "message-1",
      },
    },
  ]);
  assert.deepEqual(matchPayloads, [
    {
      matchId: "match-1",
    },
  ]);

  setMessageBroadcaster(null);
  setMatchBroadcaster(null);
});

test("discovery filters normalize valid query params", async () => {
  const validated = await discoverySchema.parseAsync({
    body: {},
    params: {},
    query: {
      type: " dog ",
      breed: " corgi ",
      minAge: "1",
      maxAge: "6",
      size: "MEDIUM",
      withPhotos: "true",
    },
  });

  assert.deepEqual(validated.query, {
    limit: 10,
    type: "dog",
    breed: "corgi",
    minAge: 1,
    maxAge: 6,
    size: "MEDIUM",
    withPhotos: true,
  });
});

test("discovery filters reject invalid age ranges", async () => {
  await assert.rejects(
    discoverySchema.parseAsync({
      body: {},
      params: {},
      query: {
        minAge: "7",
        maxAge: "2",
      },
    }),
    ZodError
  );
});

test("discovery filters build efficient Prisma filters", () => {
  assert.deepEqual(
    buildDiscoveryFilterWhere({
      type: "Dog",
      breed: "corgi",
      minAge: 1,
      maxAge: 6,
      size: "MEDIUM",
      withPhotos: true,
    }),
    {
      AND: [
        {
          type: {
            equals: "Dog",
            mode: "insensitive",
          },
        },
        {
          breed: {
            contains: "corgi",
            mode: "insensitive",
          },
        },
        {
          age: {
            gte: 1,
            lte: 6,
          },
        },
        {
          size: "MEDIUM",
        },
        {
          imageUrl: {
            not: null,
          },
        },
        {
          imageUrl: {
            not: "",
          },
        },
      ],
    }
  );
});
