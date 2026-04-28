const assert = require("node:assert/strict");
const { after, describe, it } = require("node:test");
const { ZodError } = require("zod");

const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const { requireAuth } = require("../src/middleware/auth.middleware");
const validate = require("../src/middleware/validate.middleware");
const { registerSchema } = require("../src/types/auth.schema");

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

describe("app", () => {
  it("exports an express request handler", () => {
    assert.equal(typeof app, "function");
    assert.equal(typeof app.use, "function");
  });
});

describe("requireAuth", () => {
  it("rejects requests without a bearer token", async () => {
    const error = await getNextError(requireAuth, {
      headers: {},
    });

    assert.equal(error.statusCode, 401);
    assert.equal(error.message, "Authentication required");
  });
});

describe("validate", () => {
  it("rejects invalid registration input before controller logic", async () => {
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
});
