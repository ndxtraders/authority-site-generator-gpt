"use server";

import "server-only";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";

import {
  executeContactSubmission,
  type ContactFormState,
  type ContactLogEvent,
} from "@/lib/contact-submission";
import { getSite } from "@/lib/content";
import { getLeadDeliveryConfig } from "@/lib/server/conversion-config";

export type { ContactFormState } from "@/lib/contact-submission";

/**
 * Operational logs deliberately contain no submitted fields or provider values.
 * The request ID is safe to share when diagnosing a delivery failure.
 */
function logContactEvent(event: ContactLogEvent): void {
  if (event.status === "delivered") {
    console.info("[contact]", event);
  } else {
    console.error("[contact]", event);
  }
}

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  let deliveryConfig;
  try {
    deliveryConfig = getLeadDeliveryConfig();
  } catch {
    logContactEvent({
      requestId: randomUUID(),
      status: "invalid_server_configuration",
      durationMs: 0,
    });
    return {
      status: "error",
      message: "This form isn't connected to a lead inbox yet — please call us instead.",
    };
  }

  // The path is parsed and relationship-checked by the content contract. It is
  // re-read server-side and never accepted from the client.
  const thankYouPath = getSite().conversion.thankYouPath;

  return executeContactSubmission(formData, {
    deliveryConfig,
    thankYouPath,
    fetchProvider: fetch,
    redirect,
    createRequestId: randomUUID,
    now: Date.now,
    log: logContactEvent,
  });
}
