"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import type { ContactFormProps } from "@/types/sections";

/**
 * Lead capture form.
 *
 * NOTE: submission is still simulated — it does not post anywhere. Phase 3.3 of
 * the implementation plan replaces `submitLead` with a real request to
 * `conversion.formEndpoint`. Until then this form must not be shipped to a live
 * site, because it reports success for a lead that was never captured.
 */
async function submitLead(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));
}

export default function ContactForm({
  title,
  description,
  fields,
  submitLabel,
  submittingLabel,
  successMessage,
  errorMessage,
}: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    try {
      await submitLead();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            <span>{fields.name.label}</span>
            <input
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
              name="name"
              placeholder={fields.name.placeholder}
              required
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            <span>{fields.phone.label}</span>
            <input
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
              name="phone"
              type="tel"
              placeholder={fields.phone.placeholder}
              required
            />
          </label>
        </div>

        <label className="block text-sm font-medium text-slate-700">
          <span>{fields.email.label}</span>
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            name="email"
            type="email"
            placeholder={fields.email.placeholder}
            required
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          <span>{fields.message.label}</span>
          <textarea
            className="mt-2 min-h-32 w-full rounded-lg border border-slate-300 px-3 py-2"
            name="message"
            placeholder={fields.message.placeholder}
            required
          />
        </label>

        <Button type="submit" className="w-full sm:w-auto" disabled={status === "submitting"}>
          {status === "submitting" ? submittingLabel : submitLabel}
        </Button>

        {status === "success" ? (
          <p className="text-sm text-green-700">{successMessage}</p>
        ) : null}
        {status === "error" ? <p className="text-sm text-red-700">{errorMessage}</p> : null}
      </form>
    </div>
  );
}
