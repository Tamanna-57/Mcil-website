"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import type { Field } from "@/lib/admin/schema";
import { displayName, extensionList } from "@/lib/admin/uploads";

/**
 * The controls the dashboard is built from.
 *
 * Every editor here takes a value and an `onChange`, and knows nothing about
 * where in the content it sits — the parent holds the draft and replaces the
 * branch it was handed. That keeps the nesting (a document inside a
 * sub-category inside a category) from needing any special handling.
 */

type Json = Record<string, unknown>;

const isObject = (v: unknown): v is Json =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export const inputClass =
  "w-full rounded-lg border border-steel-900/15 bg-white px-3 py-2 text-sm text-steel-900 " +
  "shadow-xs outline-none transition-colors placeholder:text-steel-800/40 " +
  "focus:border-brand-deep focus:ring-2 focus:ring-brand-deep/20";

const buttonClass =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs " +
  "font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40";

const ghostButton = `${buttonClass} text-steel-800 hover:bg-steel-900/6`;

function Label({
  children,
  help,
  htmlFor,
}: {
  children: React.ReactNode;
  help?: string;
  htmlFor?: string;
}) {
  return (
    <div className="mb-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-semibold tracking-[0.1em] text-steel-800 uppercase"
      >
        {children}
      </label>
      {help ? (
        <p className="mt-1 text-xs leading-relaxed text-steel-800/70">{help}</p>
      ) : null}
    </div>
  );
}

/* --------------------------------------------------------------- uploading */

/** The upload half of a file field: a hidden input, a button, and the wiring. */
function usePicker(
  kind: "image" | "document",
  onDone: (url: string) => void,
  onError: (message: string) => void,
) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function send(file: File) {
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("kind", kind);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        onError(data.error || "Upload failed.");
        return;
      }
      onDone(data.url);
    } catch {
      onError("Upload failed — check the connection and try again.");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  const input = (
    <input
      ref={ref}
      type="file"
      accept={
        kind === "image"
          ? "image/*"
          : extensionList("document").replace(/ /g, "")
      }
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) void send(file);
      }}
    />
  );

  return { busy, input, open: () => ref.current?.click() };
}

/* ------------------------------------------------------------------ image */

function ImageField({
  value,
  onChange,
  onError,
}: {
  value: unknown;
  onChange: (next: string) => void;
  onError: (message: string) => void;
}) {
  const src = typeof value === "string" ? value : "";
  const picker = usePicker("image", onChange, onError);

  return (
    <div className="flex items-start gap-3">
      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-steel-900/6 ring-1 ring-steel-900/10">
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            sizes="112px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <span className="flex h-full items-center justify-center text-[10px] tracking-wider text-steel-800/50 uppercase">
            Empty
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <input
          className={inputClass}
          value={src}
          placeholder="/images/hero-1.jpg"
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="mt-2 flex flex-wrap items-center gap-1">
          <button
            type="button"
            className={ghostButton}
            disabled={picker.busy}
            onClick={picker.open}
          >
            {picker.busy ? "Uploading…" : "Upload"}
          </button>
          {src ? (
            <button
              type="button"
              className={ghostButton}
              onClick={() => onChange("")}
            >
              Clear
            </button>
          ) : null}
          {picker.input}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- document */

/**
 * A filing: a PDF or spreadsheet the site offers as a download. Unlike an
 * image there is nothing to preview, so the control shows the filename, a way
 * to open it and check it is the right document, and a way to replace it.
 */
function FileField({
  value,
  onChange,
  onError,
}: {
  value: unknown;
  onChange: (next: string) => void;
  onError: (message: string) => void;
}) {
  const href = typeof value === "string" ? value : "";
  const picker = usePicker("document", onChange, onError);

  const name = href
    ? displayName(decodeURIComponent(href.split("/").pop() || ""))
    : "";

  return (
    <div className="rounded-xl border border-steel-900/12 bg-steel-900/[0.02] p-3">
      {href ? (
        <div className="flex items-center gap-3">
          <svg
            viewBox="0 0 24 24"
            className="h-7 w-7 shrink-0 text-steel-800/70"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M14 3H7a1.5 1.5 0 0 0-1.5 1.5v15A1.5 1.5 0 0 0 7 21h10a1.5 1.5 0 0 0 1.5-1.5V7.5Z" />
            <path d="M14 3v4.5h4.5" />
          </svg>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="min-w-0 flex-1 truncate text-sm font-medium text-brand-deep hover:underline"
            title={name}
          >
            {name || href}
          </a>
          <button
            type="button"
            className={ghostButton}
            disabled={picker.busy}
            onClick={picker.open}
          >
            {picker.busy ? "Uploading…" : "Replace"}
          </button>
          <button
            type="button"
            className={`${buttonClass} text-red-700 hover:bg-red-50`}
            onClick={() => onChange("")}
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={`${buttonClass} border border-dashed border-steel-900/25 text-steel-800 hover:border-brand-deep hover:text-brand-deep`}
            disabled={picker.busy}
            onClick={picker.open}
          >
            {picker.busy ? "Uploading…" : "+ Upload document"}
          </button>
          <span className="text-xs text-steel-800/60">
            No file yet — the row shows &ldquo;Download&rdquo; greyed out until
            one is added.
          </span>
        </div>
      )}

      {picker.input}

      {/* An externally hosted filing (a BSE link, say) is still perfectly
          valid, so the URL stays editable by hand. */}
      <input
        className={`${inputClass} mt-3`}
        value={href}
        placeholder="…or paste a link to a document hosted elsewhere"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/* ------------------------------------------------------------------- list */

function newRow(field: Extract<Field, { type: "list" }>): Json {
  const row: Json = structuredClone(field.template ?? {});
  if (field.identify && row.id === undefined) {
    row.id = `item-${crypto.randomUUID().slice(0, 8)}`;
  }
  return row;
}

function rowTitle(
  field: Extract<Field, { type: "list" }>,
  row: unknown,
  index: number,
) {
  const raw = isObject(row) ? row[field.titleKey] : undefined;
  const text =
    typeof raw === "string" || typeof raw === "number" ? String(raw) : "";
  return text.trim() || `Item ${index + 1}`;
}

function ListField({
  field,
  value,
  onChange,
  onError,
}: {
  field: Extract<Field, { type: "list" }>;
  value: unknown;
  onChange: (next: unknown[]) => void;
  onError: (message: string) => void;
}) {
  const rows = Array.isArray(value) ? value : [];
  const [open, setOpen] = useState<number | null>(rows.length === 1 ? 0 : null);

  function replace(index: number, next: unknown) {
    const copy = [...rows];
    copy[index] = next;
    onChange(copy);
  }

  function move(index: number, by: number) {
    const target = index + by;
    if (target < 0 || target >= rows.length) return;
    const copy = [...rows];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onChange(copy);
    setOpen((current) => (current === index ? target : current));
  }

  function remove(index: number) {
    onChange(rows.filter((_, i) => i !== index));
    setOpen(null);
  }

  function duplicate(index: number) {
    const clone = structuredClone(rows[index]) as Json;
    if (field.identify && isObject(clone)) {
      clone.id = `item-${crypto.randomUUID().slice(0, 8)}`;
    }
    const copy = [...rows];
    copy.splice(index + 1, 0, clone);
    onChange(copy);
    setOpen(index + 1);
  }

  return (
    <div className="rounded-xl border border-steel-900/12 bg-steel-900/[0.02] p-3">
      {rows.length === 0 ? (
        <p className="px-1 py-3 text-xs text-steel-800/60">Nothing here yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((row, index) => {
            const expanded = open === index;
            return (
              <li
                key={
                  (isObject(row) && typeof row.id === "string" && row.id) ||
                  `row-${index}`
                }
                className="overflow-hidden rounded-lg border border-steel-900/12 bg-white"
              >
                <div className="flex items-center gap-1 px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => setOpen(expanded ? null : index)}
                    aria-expanded={expanded}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 px-1 py-1 text-left"
                  >
                    <span
                      aria-hidden
                      className={`shrink-0 text-steel-800/50 transition-transform ${
                        expanded ? "rotate-90" : ""
                      }`}
                    >
                      ›
                    </span>
                    <span className="truncate text-sm font-medium text-steel-900">
                      {rowTitle(field, row, index)}
                    </span>
                  </button>

                  <button
                    type="button"
                    title="Move up"
                    className={ghostButton}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    className={ghostButton}
                    disabled={index === rows.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    title="Duplicate"
                    className={ghostButton}
                    onClick={() => duplicate(index)}
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    title="Delete"
                    className={`${buttonClass} text-red-700 hover:bg-red-50`}
                    onClick={() => {
                      if (
                        confirm(
                          `Delete “${rowTitle(field, row, index)}”? This cannot be undone once you save.`,
                        )
                      ) {
                        remove(index);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>

                {expanded ? (
                  <div className="border-t border-steel-900/10 bg-steel-900/[0.015] p-4">
                    <FieldList
                      fields={field.fields}
                      value={isObject(row) ? row : {}}
                      onChange={(next) => replace(index, next)}
                      onError={onError}
                    />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        className={`${buttonClass} mt-3 border border-dashed border-steel-900/25 text-steel-800 hover:border-brand-deep hover:text-brand-deep`}
        onClick={() => {
          onChange([...rows, newRow(field)]);
          setOpen(rows.length);
        }}
      >
        + {field.addLabel}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ group */

function GroupField({
  field,
  value,
  onChange,
  onError,
}: {
  field: Extract<Field, { type: "group" }>;
  value: unknown;
  onChange: (next: unknown) => void;
  onError: (message: string) => void;
}) {
  const present = isObject(value);

  if (field.optional && !present) {
    return (
      <button
        type="button"
        className={`${buttonClass} border border-dashed border-steel-900/25 text-steel-800 hover:border-brand-deep hover:text-brand-deep`}
        onClick={() => onChange({})}
      >
        + Add {field.label.toLowerCase()}
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-steel-900/12 bg-steel-900/[0.02] p-4">
      {field.optional ? (
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            className={`${buttonClass} text-red-700 hover:bg-red-50`}
            onClick={() => onChange(undefined)}
          >
            Remove {field.label.toLowerCase()}
          </button>
        </div>
      ) : null}
      <FieldList
        fields={field.fields}
        value={present ? value : {}}
        onChange={onChange}
        onError={onError}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- control */

function Control({
  field,
  value,
  onChange,
  onError,
}: {
  field: Field;
  value: unknown;
  onChange: (next: unknown) => void;
  onError: (message: string) => void;
}) {
  const id = useId();
  const asText = typeof value === "string" ? value : "";

  switch (field.type) {
    case "textarea":
      return (
        <>
          <Label help={field.help} htmlFor={id}>
            {field.label}
          </Label>
          <textarea
            id={id}
            className={`${inputClass} min-h-24 resize-y leading-relaxed`}
            value={asText}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </>
      );

    case "number": {
      const asNumber =
        typeof value === "number" ? String(value) : (asText ?? "");
      return (
        <>
          <Label help={field.help} htmlFor={id}>
            {field.label}
          </Label>
          <input
            id={id}
            type="number"
            inputMode="decimal"
            className={inputClass}
            value={asNumber}
            step={field.step}
            min={field.min}
            max={field.max}
            onChange={(e) => {
              const raw = e.target.value;
              // An empty box is "no value", not zero — writing 0 here would
              // silently change a figure the editor only meant to clear.
              onChange(raw === "" ? undefined : Number(raw));
            }}
          />
        </>
      );
    }

    case "select":
      return (
        <>
          <Label help={field.help} htmlFor={id}>
            {field.label}
          </Label>
          <select
            id={id}
            className={inputClass}
            value={asText}
            onChange={(e) =>
              onChange(e.target.value === "" ? undefined : e.target.value)
            }
          >
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </>
      );

    case "boolean":
      return (
        <label className="flex cursor-pointer items-start gap-2.5 py-1">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 cursor-pointer accent-[var(--brand-deep)]"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked || undefined)}
          />
          <span>
            <span className="text-sm font-medium text-steel-900">
              {field.label}
            </span>
            {field.help ? (
              <span className="mt-0.5 block text-xs leading-relaxed text-steel-800/70">
                {field.help}
              </span>
            ) : null}
          </span>
        </label>
      );

    case "strings": {
      const lines = Array.isArray(value) ? value.map(String) : [];
      return (
        <>
          <Label help={field.help} htmlFor={id}>
            {field.label}
          </Label>
          <textarea
            id={id}
            className={`${inputClass} min-h-20 resize-y leading-relaxed`}
            value={lines.join("\n")}
            onChange={(e) =>
              onChange(
                e.target.value
                  .split("\n")
                  .map((line) => line.trimEnd())
                  .filter((line, i, all) => line !== "" || i < all.length - 1),
              )
            }
          />
        </>
      );
    }

    case "image":
      return (
        <>
          <Label help={field.help}>{field.label}</Label>
          <ImageField value={value} onChange={onChange} onError={onError} />
        </>
      );

    case "file":
      return (
        <>
          <Label help={field.help}>{field.label}</Label>
          <FileField value={value} onChange={onChange} onError={onError} />
        </>
      );

    case "group":
      return (
        <>
          <Label help={field.help}>{field.label}</Label>
          <GroupField
            field={field}
            value={value}
            onChange={onChange}
            onError={onError}
          />
        </>
      );

    case "list":
      return (
        <>
          <Label help={field.help}>{field.label}</Label>
          <ListField
            field={field}
            value={value}
            onChange={onChange}
            onError={onError}
          />
        </>
      );

    default:
      return (
        <>
          <Label help={field.help} htmlFor={id}>
            {field.label}
          </Label>
          <input
            id={id}
            type={field.type === "date" ? "date" : "text"}
            className={inputClass}
            value={asText}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </>
      );
  }
}

/** Render a set of fields against one object, replacing it on every edit. */
export function FieldList({
  fields,
  value,
  onChange,
  onError,
}: {
  fields: Field[];
  value: Json;
  onChange: (next: Json) => void;
  onError: (message: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {fields.map((field) => (
        <div key={field.key}>
          <Control
            field={field}
            value={value[field.key]}
            onChange={(next) => {
              const copy = { ...value };
              if (next === undefined) delete copy[field.key];
              else copy[field.key] = next;
              onChange(copy);
            }}
            onError={onError}
          />
        </div>
      ))}
    </div>
  );
}
