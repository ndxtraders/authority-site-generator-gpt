import { z } from "zod";

export const CONTACT_LIMITS = {
  name: 100,
  phone: 30,
  email: 254,
  message: 2_000,
  totalBytes: 8_192,
} as const;

export const CONTACT_TIMING = {
  minimumMs: 1_500,
  maximumMs: 2 * 60 * 60 * 1_000,
} as const;

export const PROVIDER_TIMEOUT_MS = 8_000;

const CONTACT_FIELDS = ["name", "phone", "email", "message"] as const;
const EXPECTED_FORM_FIELDS = new Set([
  ...CONTACT_FIELDS,
  "website",
  "startedAt",
  "submissionId",
]);

export type ContactField = (typeof CONTACT_FIELDS)[number];
export type ContactFieldErrors = Partial<Record<ContactField, string>>;

export interface ContactFormState {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: ContactFieldErrors;
}

export interface ContactLogEvent {
  requestId: string;
  status: string;
  durationMs: number;
}

export interface LeadDeliveryConfig {
  endpoint?: string;
  authorization?: string;
}

type FetchProvider = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

export interface ContactSubmissionDependencies {
  deliveryConfig: LeadDeliveryConfig;
  thankYouPath: string;
  fetchProvider: FetchProvider;
  redirect: (path: string) => never;
  createRequestId: () => string;
  now: () => number;
  log: (event: ContactLogEvent) => void;
  timeoutMs?: number;
}

const FIELD_ERROR_MESSAGES: Record<ContactField, string> = {
  name: `Enter a name using ${CONTACT_LIMITS.name} characters or fewer.`,
  phone: "Enter a valid phone number with 10 to 15 digits.",
  email: "Enter a valid email address.",
  message: `Enter a message using ${CONTACT_LIMITS.message.toLocaleString()} characters or fewer.`,
};

const INVALID_FORM_MESSAGE = "Please check the highlighted fields and try again.";
const REJECTED_FORM_MESSAGE = "We couldn't submit this request. Please try again or call us.";
const DELIVERY_ERROR_MESSAGE = "Something went wrong. Please try again or call us.";
const UNCONFIGURED_MESSAGE =
  "This form isn't connected to a lead inbox yet — please call us instead.";

function normalizedSingleLine(maximum: number) {
  return z
    .string()
    .max(maximum)
    .transform((value) => value.trim().replace(/\s+/g, " "))
    .pipe(z.string().min(1).max(maximum));
}

const nameSchema = normalizedSingleLine(CONTACT_LIMITS.name);
const phoneSchema = z
  .string()
  .max(CONTACT_LIMITS.phone)
  .transform((value) => value.trim().replace(/\s+/g, " "))
  .pipe(
    z
      .string()
      .min(1)
      .max(CONTACT_LIMITS.phone)
      .regex(/^[+\d().\-\s]+$/)
      .refine((value) => {
        const digitCount = value.replace(/\D/g, "").length;
        return digitCount >= 10 && digitCount <= 15;
      }),
  );
const emailSchema = z
  .string()
  .max(CONTACT_LIMITS.email)
  .transform((value) => value.trim().toLowerCase())
  .pipe(z.string().min(1).max(CONTACT_LIMITS.email).email());
const messageSchema = z
  .string()
  .max(CONTACT_LIMITS.message)
  .transform((value) => value.replace(/\r\n?/g, "\n").trim())
  .pipe(z.string().min(1).max(CONTACT_LIMITS.message));

const ContactSubmissionSchema = z
  .object({
    name: nameSchema,
    phone: phoneSchema,
    email: emailSchema,
    message: messageSchema,
    website: z.string().max(200),
    startedAt: z
      .string()
      .regex(/^\d{13}$/)
      .transform((value) => Number(value)),
    submissionId: z.string().uuid(),
  })
  .strict();

const ProviderResponseSchema = z
  .object({
    accepted: z.literal(true),
  })
  .passthrough();

type ParsedContactSubmission = z.infer<typeof ContactSubmissionSchema>;

function collectFormValues(formData: FormData):
  | { success: true; values: Record<string, string> }
  | { success: false } {
  const values: Record<string, string> = {};
  const counts = new Map<string, number>();
  const encoder = new TextEncoder();
  let totalBytes = 0;

  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string") return { success: false };
    totalBytes += encoder.encode(key).byteLength + encoder.encode(value).byteLength;
    if (totalBytes > CONTACT_LIMITS.totalBytes) return { success: false };

    // React/Next may attach internal action metadata to native FormData.
    if (key.startsWith("$ACTION_")) continue;
    if (!EXPECTED_FORM_FIELDS.has(key)) return { success: false };

    counts.set(key, (counts.get(key) ?? 0) + 1);
    values[key] = value;
  }

  for (const field of EXPECTED_FORM_FIELDS) {
    if (counts.get(field) !== 1) return { success: false };
  }

  return { success: true, values };
}

function fieldErrors(error: z.ZodError): ContactFieldErrors {
  const errors: ContactFieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && CONTACT_FIELDS.includes(field as ContactField)) {
      const contactField = field as ContactField;
      errors[contactField] = FIELD_ERROR_MESSAGES[contactField];
    }
  }
  return errors;
}

function errorState(message: string, errors?: ContactFieldErrors): ContactFormState {
  return {
    status: "error",
    message,
    ...(errors && Object.keys(errors).length > 0 ? { fieldErrors: errors } : {}),
  };
}

function providerStatusCategory(status: number): string {
  if (status >= 400 && status < 500) return "provider_4xx";
  if (status >= 500) return "provider_5xx";
  return "provider_unexpected_status";
}

function safeLog(
  dependencies: ContactSubmissionDependencies,
  requestId: string,
  status: string,
  startedAt: number,
): void {
  dependencies.log({
    requestId,
    status,
    durationMs: Math.max(0, dependencies.now() - startedAt),
  });
}

function passesSpamControls(submission: ParsedContactSubmission, now: number): boolean {
  if (submission.website.trim() !== "") return false;
  const elapsed = now - submission.startedAt;
  return elapsed >= CONTACT_TIMING.minimumMs && elapsed <= CONTACT_TIMING.maximumMs;
}

export async function executeContactSubmission(
  formData: FormData,
  dependencies: ContactSubmissionDependencies,
): Promise<ContactFormState> {
  const requestId = dependencies.createRequestId();
  const startedAt = dependencies.now();

  const collected = collectFormValues(formData);
  if (!collected.success) {
    safeLog(dependencies, requestId, "validation_rejected", startedAt);
    return errorState(REJECTED_FORM_MESSAGE);
  }

  const parsed = ContactSubmissionSchema.safeParse(collected.values);
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    const hasFieldErrors = Object.keys(errors).length > 0;
    safeLog(
      dependencies,
      requestId,
      hasFieldErrors ? "validation_rejected" : "spam_rejected",
      startedAt,
    );
    return errorState(hasFieldErrors ? INVALID_FORM_MESSAGE : REJECTED_FORM_MESSAGE, errors);
  }

  if (!passesSpamControls(parsed.data, startedAt)) {
    safeLog(dependencies, requestId, "spam_rejected", startedAt);
    return errorState(REJECTED_FORM_MESSAGE);
  }

  if (!dependencies.deliveryConfig.endpoint) {
    safeLog(dependencies, requestId, "delivery_not_configured", startedAt);
    return errorState(UNCONFIGURED_MESSAGE);
  }

  const abortController = new AbortController();
  const timeout = setTimeout(
    () => abortController.abort(),
    dependencies.timeoutMs ?? PROVIDER_TIMEOUT_MS,
  );

  let response: Response;
  let providerData: unknown;
  let providerPhase: "request" | "response_body" = "request";
  try {
    response = await dependencies.fetchProvider(dependencies.deliveryConfig.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": parsed.data.submissionId,
        "X-Request-ID": requestId,
        ...(dependencies.deliveryConfig.authorization
          ? { Authorization: dependencies.deliveryConfig.authorization }
          : {}),
      },
      body: JSON.stringify({
        requestId,
        submissionId: parsed.data.submissionId,
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email,
        message: parsed.data.message,
      }),
      signal: abortController.signal,
    });

    if (!response.ok) {
      safeLog(dependencies, requestId, providerStatusCategory(response.status), startedAt);
      return errorState(DELIVERY_ERROR_MESSAGE);
    }

    providerPhase = "response_body";
    providerData = await response.json();
  } catch {
    const status = abortController.signal.aborted
      ? "provider_timeout"
      : providerPhase === "response_body"
        ? "provider_invalid_response"
        : "provider_network_error";
    safeLog(dependencies, requestId, status, startedAt);
    return errorState(DELIVERY_ERROR_MESSAGE);
  } finally {
    clearTimeout(timeout);
  }

  if (!ProviderResponseSchema.safeParse(providerData).success) {
    safeLog(dependencies, requestId, "provider_invalid_response", startedAt);
    return errorState(DELIVERY_ERROR_MESSAGE);
  }

  safeLog(dependencies, requestId, "delivered", startedAt);
  dependencies.redirect(dependencies.thankYouPath);
}
