"use client";

import { useState, type FormEvent } from "react";
import { company } from "@/lib/company";

/**
 * The lower half of the contact card: how to reach us on the left, the message
 * form on the right.
 *
 * There is no server behind the form, so rather than swallow an enquiry it
 * composes one — submitting opens the visitor's mail client with everything
 * they typed already in the body. Swap the handler for a POST once there is an
 * endpoint to post to; the markup does not change.
 */
export default function ContactForm({ address }: { address?: string }) {
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
    ].join("\n");

    const subject = name ? `Enquiry from ${name}` : "Website enquiry";
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <div className="grid gap-10 bg-background px-7 py-10 sm:px-10 sm:py-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
      <div>
        <span className="text-steel-900" aria-hidden>
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="2.5" y="5" width="19" height="14" rx="1.5" />
            <path d="M3 6.5l9 6.5 9-6.5" strokeLinecap="round" />
          </svg>
        </span>

        <h2 className="font-display mt-4 text-xl leading-snug font-semibold text-steel-900 sm:text-2xl">
          For orders, specifications
          <br className="hidden sm:block" /> and project enquiries,
          <br className="hidden sm:block" /> please email:
        </h2>

        <a
          href={`mailto:${company.email}`}
          className="mt-4 inline-block border-b border-steel-900/40 pb-0.5 text-base font-semibold text-steel-900 transition-colors hover:border-brand-deep hover:text-brand-deep"
        >
          {company.email}
        </a>
        <p className="mt-2 text-xs text-steel-800/75">
          or send a message via this form
        </p>

        {address && (
          <p
            key={address}
            className="cc-swap mt-8 text-sm leading-relaxed text-steel-800"
          >
            {address}
          </p>
        )}
      </div>

      <form onSubmit={onSubmit}>
        <h3 className="font-display text-lg font-semibold text-steel-900">
          Contact
        </h3>

        <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <Field
            name="firstName"
            label="First name"
            autoComplete="given-name"
          />
          <Field name="lastName" label="Last name" autoComplete="family-name" />
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
          className="mt-8 inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-steel-900 px-7 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-brand-deep"
        >
          Submit
          <svg
            width="14"
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
          className="mt-3 text-[11px] text-steel-800/65"
          role="status"
          aria-live="polite"
        >
          {sent
            ? `Your mail app should be opening, addressed to ${company.email}.`
            : "Submitting opens your mail app with these details filled in."}
        </p>
      </form>
    </div>
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
    "cf-input mt-1.5 w-full border-0 border-b border-steel-900/25 bg-transparent pb-1.5 text-sm text-steel-900 outline-none transition-colors focus:border-brand-deep";

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="text-[10px] tracking-[0.12em] text-steel-800/70 uppercase"
      >
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          rows={2}
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
