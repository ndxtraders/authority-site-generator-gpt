import "server-only";

import { z } from "zod";

const optionalEnvironmentValue = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).optional(),
);

const httpEndpoint = z.string().trim().url().refine(
  (value) => {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  },
  { message: "must be an absolute HTTP(S) URL" },
);

const LeadDeliveryConfigSchema = z
  .object({
    endpoint: z.preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      httpEndpoint.optional(),
    ),
    authorization: optionalEnvironmentValue,
  })
  .strict()
  .refine((config) => config.endpoint || !config.authorization, {
    message: "LEAD_DELIVERY_AUTHORIZATION requires LEAD_DELIVERY_ENDPOINT",
  });

export type LeadDeliveryConfig = z.infer<typeof LeadDeliveryConfigSchema>;

/**
 * The only module allowed to read lead-provider deployment configuration.
 * Neither variable may use the NEXT_PUBLIC_ prefix.
 */
export function getLeadDeliveryConfig(): LeadDeliveryConfig {
  const result = LeadDeliveryConfigSchema.safeParse({
    endpoint: process.env.LEAD_DELIVERY_ENDPOINT,
    authorization: process.env.LEAD_DELIVERY_AUTHORIZATION,
  });

  if (!result.success) {
    throw new Error("Invalid server-only lead-delivery configuration");
  }

  return result.data;
}
