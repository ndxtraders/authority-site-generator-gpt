"use client";

import { useActionState, useEffect, useRef } from "react";

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
  const startedAtRef = useRef<HTMLInputElement>(null);
  const submissionIdRef = useRef<HTMLInputElement>(null);
  const startedAtValueRef = useRef<string | null>(null);
  const submissionIdValueRef = useRef<string | null>(null);

  useEffect(() => {
    if (isPending) return;
    startedAtValueRef.current ??= String(Date.now());
    submissionIdValueRef.current ??= crypto.randomUUID();
    if (startedAtRef.current) startedAtRef.current.value = startedAtValueRef.current;
    if (submissionIdRef.current) {
      submissionIdRef.current.value = submissionIdValueRef.current;
    }
  }, [isPending]);

  const fieldError = (field: keyof NonNullable<ContactFormState["fieldErrors"]>) =>
    state.fieldErrors?.[field];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>

      <form action={formAction} className="relative mt-8 space-y-4" aria-busy={isPending}>
        <input
          ref={startedAtRef}
          type="hidden"
          name="startedAt"
        />
        <input
          ref={submissionIdRef}
          type="hidden"
          name="submissionId"
        />

        <div
          className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"
          aria-hidden="true"
        >
          <label htmlFor="contact-website">Website</label>
          <input
            id="contact-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label htmlFor="contact-name" className="text-sm font-medium text-slate-700">
            <span>{fields.name.label}</span>
            <input
              id="contact-name"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
              name="name"
              placeholder={fields.name.placeholder}
              maxLength={100}
              aria-invalid={fieldError("name") ? true : undefined}
              aria-describedby={fieldError("name") ? "contact-name-error" : undefined}
              required
            />
            {fieldError("name") ? (
              <span id="contact-name-error" className="mt-1 block text-sm text-red-700">
                {fieldError("name")}
              </span>
            ) : null}
          </label>
          <label htmlFor="contact-phone" className="text-sm font-medium text-slate-700">
            <span>{fields.phone.label}</span>
            <input
              id="contact-phone"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
              name="phone"
              type="tel"
              inputMode="tel"
              placeholder={fields.phone.placeholder}
              maxLength={30}
              aria-invalid={fieldError("phone") ? true : undefined}
              aria-describedby={fieldError("phone") ? "contact-phone-error" : undefined}
              required
            />
            {fieldError("phone") ? (
              <span id="contact-phone-error" className="mt-1 block text-sm text-red-700">
                {fieldError("phone")}
              </span>
            ) : null}
          </label>
        </div>

        <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700">
          <span>{fields.email.label}</span>
          <input
            id="contact-email"
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            name="email"
            type="email"
            placeholder={fields.email.placeholder}
            maxLength={254}
            aria-invalid={fieldError("email") ? true : undefined}
            aria-describedby={fieldError("email") ? "contact-email-error" : undefined}
            required
          />
          {fieldError("email") ? (
            <span id="contact-email-error" className="mt-1 block text-sm text-red-700">
              {fieldError("email")}
            </span>
          ) : null}
        </label>

        <label htmlFor="contact-message" className="block text-sm font-medium text-slate-700">
          <span>{fields.message.label}</span>
          <textarea
            id="contact-message"
            className="mt-2 min-h-32 w-full rounded-lg border border-slate-300 px-3 py-2"
            name="message"
            placeholder={fields.message.placeholder}
            maxLength={2000}
            aria-invalid={fieldError("message") ? true : undefined}
            aria-describedby={fieldError("message") ? "contact-message-error" : undefined}
            required
          />
          {fieldError("message") ? (
            <span id="contact-message-error" className="mt-1 block text-sm text-red-700">
              {fieldError("message")}
            </span>
          ) : null}
        </label>

        <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
          {isPending ? submittingLabel : submitLabel}
        </Button>

        {state.status === "error" ? (
          <p className="text-sm text-red-700" role="alert" aria-live="polite">
            {state.message ?? errorMessage}
          </p>
        ) : null}
      </form>
    </div>
  );
}
