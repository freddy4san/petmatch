const assert = require("node:assert/strict");
const { after, test } = require("node:test");
const { ZodError } = require("zod");

const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const { requireAuth } = require("../src/middleware/auth.middleware");
const validate = require("../src/middleware/validate.middleware");
const { buildDiscoveryFilterWhere } = require("../src/services/discovery.service");
const { registerSchema } = require("../src/types/auth.schema");
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

test("app exports an express request handler", () => {
  assert.equal(typeof app, "function");
  assert.equal(typeof app.use, "function");
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
