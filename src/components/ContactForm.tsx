"use client";

import { useState, type FormEvent } from "react";
import { company } from "@/lib/company";

/**
 * The message form has no server behind it, so rather than swallow an enquiry
 * it composes one: submitting opens the visitor's mail client with everything
 * they typed already in the body, addressed to MCIL. Swap the handler for a
 * POST once there is an endpoint to post to — the markup does not change.
 */
export default function ContactForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (name: string) => String(data.get(name) ?? "").trim();

    const name = [get("firstName"), get("lastName")].filter(Boolean).join(" ");
    const body = [
      name && `Name: ${name}`,
      get("company") && `Company: ${get("company")}`,
      get("email") && `Email: ${get("email")}`,
      "",
      get("message"),
    ]
      .filter((line) => line !== undefined)
      .join("\n");

    const subject = name ? `Enquiry from ${name}` : "Website enquiry";
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <section className="bg-background px-6 py-16 sm:px-10 lg:px-[6.5vw] lg:py-24">
      <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <div>
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-pale text-brand-deep"
            aria-hidden
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <rect x="2.5" y="5" width="19" height="14" rx="2" />
              <path d="M3 6.5l9 6.5 9-6.5" strokeLinecap="round" />
            </svg>
          </span>
          <h2 className="type-display mt-6 text-[clamp(1.4rem,3vw,2rem)] leading-tight text-steel-900">
            For orders, specifications and general enquiries, please email:
          </h2>
          <a
            href={`mailto:${company.email}`}
            className="mt-4 inline-block border-b border-steel-900/30 pb-0.5 text-base font-semibold text-steel-900 transition-colors hover:border-brand-deep hover:text-brand-deep"
          >
            {company.email}
          </a>
          <p className="mt-3 text-sm text-steel-800/80">
            or send a message via this form
          </p>
          <p className="mt-8 max-w-sm text-sm leading-relaxed text-steel-800">
            Send the grade, thickness, width and quantity you need and we will
            come back with what the line can hold and when it can ship.
          </p>
        </div>

        <form onSubmit={onSubmit} className="cf-form">
          <h3 className="font-display text-xl font-semibold text-steel-900">
            Contact
          </h3>

          <div className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-2">
            <Field
              name="firstName"
              label="First name"
              autoComplete="given-name"
            />
            <Field
              name="lastName"
              label="Last name"
              autoComplete="family-name"
            />
            <Field
              name="company"
              label="Company"
              autoComplete="organization"
              className="sm:col-span-2"
            />
            <Field
              name="email"
              label="Email"
              type="email"
              required
              autoComplete="email"
              className="sm:col-span-2"
            />
            <Field
              name="message"
              label="Write a message"
              multiline
              className="sm:col-span-2"
            />
          </div>

          <button
            type="submit"
            className="mt-9 inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-steel-900 px-7 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-brand-deep"
          >
            Submit
            <svg
              width="15"
              height="10"
              viewBox="0 0 15 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden
            >
              <path d="M0 5h13M9 1l4 4-4 4" strokeLinecap="round" />
            </svg>
          </button>

          <p
            className="mt-4 text-xs text-steel-800/70"
            role="status"
            aria-live="polite"
          >
            {sent
              ? `Your mail app should be opening with this message addressed to ${company.email}.`
              : "Submitting opens your mail app with these details filled in."}
          </p>
        </form>
      </div>
    </section>
  );
}

/** Underlined field: the label sits above the rule and the rule is the input. */
function Field({
  name,
  label,
  type = "text",
  required = false,
  multiline = false,
  autoComplete,
  className = "",
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  multiline?: boolean;
  autoComplete?: string;
  className?: string;
}) {
  const id = `cf-${name}`;
  const shared =
    "cf-input mt-2 w-full border-0 border-b border-steel-900/20 bg-transparent pb-2 text-sm text-steel-900 outline-none transition-colors placeholder:text-steel-800/40 focus:border-brand-deep";

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="text-[11px] tracking-[0.1em] text-steel-800/75 uppercase"
      >
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          rows={3}
          required={required}
          className={`${shared} resize-none`}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          autoComplete={autoComplete}
          className={shared}
        />
      )}
    </div>
  );
}
