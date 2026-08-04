"use client";

import { useActionState } from "react";

import { submitContactForm, type ContactFormState } from "@/lib/actions/contact";
import { Button } from "@/components/ui/button";
import type { ContactFormProps } from "@/types/sections";

const INITIAL_STATE: ContactFormState = { status: "idle" };

export default function ContactForm({
  title,
  description,
  fields,
  submitLabel,
  submittingLabel,
  errorMessage,
}: ContactFormProps) {
  const [state, formAction, isPending] = useActionState(submitContactForm, INITIAL_STATE);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>

      <form action={formAction} className="mt-8 space-y-4">
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

        <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
          {isPending ? submittingLabel : submitLabel}
        </Button>

        {state.status === "error" ? (
          <p className="text-sm text-red-700">{state.message ?? errorMessage}</p>
        ) : null}
      </form>
    </div>
  );
}
