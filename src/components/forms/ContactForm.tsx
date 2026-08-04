"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";

interface ContactFormProps {
  heading: string;
  subheading: string;
}

export default function ContactForm({ heading, subheading }: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    await new Promise((resolve) => setTimeout(resolve, 600));

    setStatus("success");
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h3 className="text-2xl font-semibold text-slate-900">{heading}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{subheading}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            <span>Name</span>
            <input
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
              name="name"
              placeholder="Your name"
              required
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            <span>Phone</span>
            <input
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
              name="phone"
              placeholder="(555) 123-4567"
              required
            />
          </label>
        </div>

        <label className="block text-sm font-medium text-slate-700">
          <span>Email</span>
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          <span>How can we help?</span>
          <textarea
            className="mt-2 min-h-32 w-full rounded-lg border border-slate-300 px-3 py-2"
            name="message"
            placeholder="Tell us about your project"
            required
          />
        </label>

        <Button type="submit" className="w-full sm:w-auto" disabled={status === "submitting"}>
          {status === "submitting" ? "Sending..." : "Request a Free Estimate"}
        </Button>

        {status === "success" ? (
          <p className="text-sm text-green-700">Thanks! We&apos;ll be in touch shortly.</p>
        ) : null}
      </form>
    </div>
  );
}
