import assert from "node:assert/strict";
import test from "node:test";

import {
  CONTACT_TIMING,
  executeContactSubmission,
  type ContactLogEvent,
  type ContactSubmissionDependencies,
} from "../src/lib/contact-submission.ts";

const NOW = 1_800_000_000_000;
const SUBMISSION_ID = "123e4567-e89b-42d3-a456-426614174000";

class RedirectSignal extends Error {
  readonly path: string;

  constructor(path: string) {
    super(`Redirect to ${path}`);
    this.path = path;
  }
}

interface TestContext {
  dependencies: ContactSubmissionDependencies;
  fetchCalls: Array<{ input: string | URL | Request; init?: RequestInit }>;
  logs: ContactLogEvent[];
}

function validForm(): FormData {
  const form = new FormData();
  form.set("name", "  Ada   Lovelace  ");
  form.set("phone", " (209) 555-0148 ");
  form.set("email", " ADA@EXAMPLE.COM ");
  form.set("message", "  I need help with a project.  ");
  form.set("website", "");
  form.set("startedAt", String(NOW - 5_000));
  form.set("submissionId", SUBMISSION_ID);
  return form;
}

function acceptedResponse(): Response {
  return Response.json({ accepted: true }, { status: 202 });
}

function testContext(
  overrides: Partial<ContactSubmissionDependencies> = {},
): TestContext {
  const fetchCalls: TestContext["fetchCalls"] = [];
  const logs: ContactLogEvent[] = [];

  const dependencies: ContactSubmissionDependencies = {
    deliveryConfig: {
      endpoint: "https://provider.test/leads",
      authorization: "Bearer test-only",
    },
    thankYouPath: "/thank-you",
    fetchProvider: async (input, init) => {
      fetchCalls.push({ input, init });
      return acceptedResponse();
    },
    redirect: (path) => {
      throw new RedirectSignal(path);
    },
    createRequestId: () => "request-123",
    now: () => NOW,
    log: (event) => logs.push(event),
    ...overrides,
  };

  return { dependencies, fetchCalls, logs };
}

async function expectRejectedWithoutDelivery(
  form: FormData,
  expectedStatus: string,
): Promise<void> {
  const context = testContext();
  const state = await executeContactSubmission(form, context.dependencies);

  assert.equal(state.status, "error");
  assert.equal(context.fetchCalls.length, 0);
  assert.equal(context.logs.at(-1)?.status, expectedStatus);
  assert.doesNotMatch(JSON.stringify(state), /Ada|EXAMPLE|project/);
}

test("valid input is normalized, delivered, and redirected after provider acceptance", async () => {
  const context = testContext();

  await assert.rejects(
    () => executeContactSubmission(validForm(), context.dependencies),
    (cause: unknown) => cause instanceof RedirectSignal && cause.path === "/thank-you",
  );

  assert.equal(context.fetchCalls.length, 1);
  const call = context.fetchCalls[0];
  assert.equal(call.input, "https://provider.test/leads");
  const headers = new Headers(call.init?.headers);
  assert.equal(headers.get("Authorization"), "Bearer test-only");
  assert.equal(headers.get("Idempotency-Key"), SUBMISSION_ID);
  assert.equal(headers.get("X-Request-ID"), "request-123");

  const body = JSON.parse(String(call.init?.body));
  assert.deepEqual(body, {
    requestId: "request-123",
    submissionId: SUBMISSION_ID,
    name: "Ada Lovelace",
    phone: "(209) 555-0148",
    email: "ada@example.com",
    message: "I need help with a project.",
  });
  assert.deepEqual(context.logs, [
    { requestId: "request-123", status: "delivered", durationMs: 0 },
  ]);
});

for (const [field, value] of [
  ["name", ""],
  ["name", "n".repeat(101)],
  ["phone", "12345"],
  ["phone", "209-CALL-NOW"],
  ["email", "not-an-email"],
  ["email", `${"e".repeat(250)}@example.com`],
  ["message", ""],
  ["message", "m".repeat(2_001)],
] as const) {
  test(`${field} rejects invalid input before provider delivery`, async () => {
    const form = validForm();
    form.set(field, value);
    const context = testContext();
    const state = await executeContactSubmission(form, context.dependencies);

    assert.equal(state.status, "error");
    assert.ok(state.fieldErrors?.[field]);
    assert.equal(context.fetchCalls.length, 0);
    assert.equal(context.logs.at(-1)?.status, "validation_rejected");
    if (value.length > 0) {
      const excerpt = value.slice(0, 20).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      assert.doesNotMatch(JSON.stringify(state), new RegExp(excerpt));
    }
  });
}

test("unexpected fields are rejected before provider delivery", async () => {
  const form = validForm();
  form.set("admin", "true");
  await expectRejectedWithoutDelivery(form, "validation_rejected");
});

test("framework action metadata is accepted but never forwarded", async () => {
  const form = validForm();
  form.set("$ACTION_KEY", "framework-metadata");
  const context = testContext();

  await assert.rejects(
    () => executeContactSubmission(form, context.dependencies),
    RedirectSignal,
  );

  assert.doesNotMatch(String(context.fetchCalls[0].init?.body), /ACTION|framework-metadata/);
});

test("oversized framework metadata is rejected before provider delivery", async () => {
  const form = validForm();
  form.set("$ACTION_KEY", "x".repeat(8_192));
  await expectRejectedWithoutDelivery(form, "validation_rejected");
});

test("duplicate fields are rejected before provider delivery", async () => {
  const form = validForm();
  form.append("email", "second@example.com");
  await expectRejectedWithoutDelivery(form, "validation_rejected");
});

test("aggregate oversized input is rejected before provider delivery", async () => {
  const form = validForm();
  form.set("message", "😀".repeat(1_100));
  await expectRejectedWithoutDelivery(form, "validation_rejected");
});

test("honeypot bot submissions never reach the provider", async () => {
  const form = validForm();
  form.set("website", "https://spam.test");
  await expectRejectedWithoutDelivery(form, "spam_rejected");
});

for (const [label, startedAt] of [
  ["too fast", NOW - CONTACT_TIMING.minimumMs + 1],
  ["stale", NOW - CONTACT_TIMING.maximumMs - 1],
] as const) {
  test(`${label} submissions fail the timing control`, async () => {
    const form = validForm();
    form.set("startedAt", String(startedAt));
    await expectRejectedWithoutDelivery(form, "spam_rejected");
  });
}

test("unconfigured delivery returns an error without calling the provider", async () => {
  const context = testContext({ deliveryConfig: {} });
  const state = await executeContactSubmission(validForm(), context.dependencies);

  assert.equal(state.status, "error");
  assert.equal(context.fetchCalls.length, 0);
  assert.equal(context.logs.at(-1)?.status, "delivery_not_configured");
});

test("provider timeout aborts delivery and returns a predictable error", async () => {
  const context = testContext({
    timeoutMs: 5,
    fetchProvider: async (_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new Error("aborted")), {
          once: true,
        });
      }),
  });

  const state = await executeContactSubmission(validForm(), context.dependencies);
  assert.equal(state.status, "error");
  assert.equal(context.logs.at(-1)?.status, "provider_timeout");
});

test("provider timeout remains active while the response body is read", async () => {
  const context = testContext({
    timeoutMs: 5,
    fetchProvider: async (_input, init) => {
      const body = new ReadableStream({
        start(controller) {
          init?.signal?.addEventListener(
            "abort",
            () => controller.error(new Error("aborted")),
            { once: true },
          );
        },
      });
      return new Response(body, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    },
  });

  const state = await executeContactSubmission(validForm(), context.dependencies);
  assert.equal(state.status, "error");
  assert.equal(context.logs.at(-1)?.status, "provider_timeout");
});

test("provider network errors return a predictable error", async () => {
  const context = testContext({
    fetchProvider: async () => {
      throw new Error("network unavailable");
    },
  });

  const state = await executeContactSubmission(validForm(), context.dependencies);
  assert.equal(state.status, "error");
  assert.equal(context.logs.at(-1)?.status, "provider_network_error");
});

for (const [label, response, expectedStatus] of [
  ["4xx", new Response("rejected", { status: 422 }), "provider_4xx"],
  ["5xx", new Response("failed", { status: 503 }), "provider_5xx"],
] as const) {
  test(`provider ${label} responses do not redirect`, async () => {
    const context = testContext({ fetchProvider: async () => response });
    const state = await executeContactSubmission(validForm(), context.dependencies);

    assert.equal(state.status, "error");
    assert.equal(context.logs.at(-1)?.status, expectedStatus);
  });
}

for (const [label, response] of [
  ["non-JSON", new Response("accepted", { status: 200 })],
  ["negative acknowledgment", Response.json({ accepted: false }, { status: 200 })],
] as const) {
  test(`provider ${label} response is rejected as malformed`, async () => {
    const context = testContext({ fetchProvider: async () => response });
    const state = await executeContactSubmission(validForm(), context.dependencies);

    assert.equal(state.status, "error");
    assert.equal(context.logs.at(-1)?.status, "provider_invalid_response");
  });
}

test("duplicate submissions send the same provider idempotency key", async () => {
  const idempotencyKeys: string[] = [];
  const context = testContext({
    fetchProvider: async (_input, init) => {
      idempotencyKeys.push(new Headers(init?.headers).get("Idempotency-Key") ?? "");
      return acceptedResponse();
    },
  });

  for (let attempt = 0; attempt < 2; attempt += 1) {
    await assert.rejects(
      () => executeContactSubmission(validForm(), context.dependencies),
      RedirectSignal,
    );
  }

  assert.deepEqual(idempotencyKeys, [SUBMISSION_ID, SUBMISSION_ID]);
});
