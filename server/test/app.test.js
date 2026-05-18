const assert = require("node:assert/strict");
const { after, test } = require("node:test");
const http = require("node:http");
const express = require("express");
const { ZodError } = require("zod");

const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const {
  AUTH_RATE_LIMIT_MESSAGE,
  createAuthRateLimiter,
} = require("../src/middleware/auth-rate-limit.middleware");
const { requireAuth } = require("../src/middleware/auth.middleware");
const { errorHandler } = require("../src/middleware/error.middleware");
const validate = require("../src/middleware/validate.middleware");
const { buildDiscoveryFilterWhere } = require("../src/services/discovery.service");
const {
  registerSchema,
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
