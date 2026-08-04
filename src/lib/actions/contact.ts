"use server";

import "server-only";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";

import { getSite } from "@/lib/content";
import { getLeadDeliveryConfig } from "@/lib/server/conversion-config";

export interface ContactFormState {
  status: "idle" | "error";
  message?: string;
}

/**
 * Operational logs deliberately contain no submitted fields or provider values.
 * The request ID is safe to share when diagnosing a delivery failure.
 */
function logContactEvent(
  level: "info" | "error",
  requestId: string,
  status: string,
  startedAt: number,
): void {
  const details = {
    requestId,
    status,
    durationMs: Date.now() - startedAt,
  };

  if (level === "info") {
    console.info("[contact]", details);
  } else {
    console.error("[contact]", details);
  }
}

function providerStatusCategory(status: number): string {
  if (status >= 400 && status < 500) return "provider_4xx";
  if (status >= 500) return "provider_5xx";
  return "provider_unexpected_status";
}

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const requestId = randomUUID();
  const startedAt = Date.now();
  const name = formData.get("name")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const message = formData.get("message")?.toString().trim();

  if (!name || !phone || !email || !message) {
    logContactEvent("error", requestId, "validation_rejected", startedAt);
    return { status: "error", message: "Please fill in every field." };
  }

  let deliveryConfig;
  try {
    deliveryConfig = getLeadDeliveryConfig();
  } catch {
    logContactEvent("error", requestId, "invalid_server_configuration", startedAt);
    return {
      status: "error",
      message: "This form isn't connected to a lead inbox yet — please call us instead.",
    };
  }

  if (!deliveryConfig.endpoint) {
    logContactEvent("error", requestId, "delivery_not_configured", startedAt);
    return {
      status: "error",
      message: "This form isn't connected to a lead inbox yet — please call us instead.",
    };
  }

  // The path is parsed and relationship-checked by the content contract. It is
  // re-read server-side and never accepted from the client.
  const thankYouPath = getSite().conversion.thankYouPath;

  let response: Response;
  try {
    response = await fetch(deliveryConfig.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(deliveryConfig.authorization
          ? { Authorization: deliveryConfig.authorization }
          : {}),
      },
      body: JSON.stringify({ requestId, name, phone, email, message }),
    });
  } catch {
    logContactEvent("error", requestId, "provider_network_error", startedAt);
    return { status: "error", message: "Something went wrong. Please try again or call us." };
  }

  if (!response.ok) {
    logContactEvent("error", requestId, providerStatusCategory(response.status), startedAt);
    return { status: "error", message: "Something went wrong. Please try again or call us." };
  }

  logContactEvent("info", requestId, "delivered", startedAt);
  redirect(thankYouPath);
}
