"use server";

import { redirect } from "next/navigation";

import { getSite } from "@/lib/content";

export interface ContactFormState {
  status: "idle" | "error";
  message?: string;
}

/**
 * Submits a lead to `conversion.formEndpoint` and redirects to
 * `conversion.thankYouPath` on success.
 *
 * `formEndpoint` is empty until a real delivery provider (email/CRM) is chosen
 * — see `ConversionConfig` in `src/types/site.ts`. Until then this returns a
 * clear error instead of a fabricated success, which is what the old
 * `submitLead()` stub did.
 */
export async function submitContactForm(
  thankYouPath: string,
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = formData.get("name")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const message = formData.get("message")?.toString().trim();

  if (!name || !phone || !email || !message) {
    return { status: "error", message: "Please fill in every field." };
  }

  const { formEndpoint } = getSite().conversion;

  if (!formEndpoint) {
    console.error("[contact] formEndpoint is not configured — lead was not delivered:", {
      name,
      phone,
      email,
      message,
    });
    return {
      status: "error",
      message: "This form isn't connected to a lead inbox yet — please call us instead.",
    };
  }

  let response: Response;
  try {
    response = await fetch(formEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, email, message }),
    });
  } catch {
    return { status: "error", message: "Something went wrong. Please try again or call us." };
  }

  if (!response.ok) {
    return { status: "error", message: "Something went wrong. Please try again or call us." };
  }

  redirect(thankYouPath);
}
